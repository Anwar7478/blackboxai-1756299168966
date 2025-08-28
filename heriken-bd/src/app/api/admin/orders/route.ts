import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'ALL') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { phone: { contains: search } } },
        { shippingName: { contains: search } },
        { shippingPhone: { contains: search } }
      ]
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z')
      }
    }

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              },
              variant: {
                select: {
                  id: true,
                  options: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              method: true,
              type: true,
              amount: true,
              status: true,
              createdAt: true
            }
          },
          shipments: {
            select: {
              id: true,
              courier: true,
              awb: true,
              status: true,
              trackingUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    // Get summary statistics
    const stats = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: {
        createdAt: startDate || endDate ? {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate + 'T23:59:59.999Z') : undefined
        } : undefined
      }
    })

    const summary = {
      total: totalCount,
      pending: stats.find(s => s.status === 'PENDING')?._count.status || 0,
      confirmed: stats.find(s => s.status === 'CONFIRMED')?._count.status || 0,
      processing: stats.find(s => s.status === 'PROCESSING')?._count.status || 0,
      shipped: stats.find(s => s.status === 'SHIPPED')?._count.status || 0,
      delivered: stats.find(s => s.status === 'DELIVERED')?._count.status || 0,
      cancelled: stats.find(s => s.status === 'CANCELLED')?._count.status || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        summary
      }
    })

  } catch (error) {
    console.error('Admin orders API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { orderId, status, fulfillmentStatus, notes } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Update order
    const updateData: any = {}
    if (status) updateData.status = status
    if (fulfillmentStatus) updateData.fulfillmentStatus = fulfillmentStatus
    if (notes !== undefined) updateData.internalNotes = notes

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Log the change
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_ORDER',
        entity: 'Order',
        entityId: orderId,
        newValues: updateData
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedOrder
    })

  } catch (error) {
    console.error('Admin update order API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
