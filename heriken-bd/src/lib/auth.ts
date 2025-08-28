import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { redisHelpers } from './redis'
import { mimSMSService } from './services/mimsms'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Phone + OTP Provider
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
        name: { label: 'Name', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          throw new Error('Phone number and OTP are required')
        }

        // Validate phone number format
        if (!mimSMSService.isValidBangladeshPhone(credentials.phone)) {
          throw new Error('Invalid phone number format')
        }

        // Verify OTP
        const storedOTP = await redisHelpers.getOTP(credentials.phone)
        if (!storedOTP || storedOTP !== credentials.otp) {
          throw new Error('Invalid or expired OTP')
        }

        // Delete used OTP
        await redisHelpers.deleteOTP(credentials.phone)

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        })

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              phone: credentials.phone,
              name: credentials.name || 'User',
              phoneVerified: new Date(),
              isActive: true
            }
          })
        } else {
          // Update phone verification
          user = await prisma.user.update({
            where: { id: user.id },
            data: { phoneVerified: new Date() }
          })
        }

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatar
        }
      }
    }),

    // Email + Password Provider
    CredentialsProvider({
      id: 'email-password',
      name: 'Email Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password)
        if (!isValidPassword) {
          throw new Error('Invalid email or password')
        }

        if (!user.isActive) {
          throw new Error('Account is deactivated')
        }

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatar
        }
      }
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),

    // Facebook OAuth Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || ''
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          // Check if user exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            // Link social account to existing user
            const socialField = account.provider === 'google' ? 'googleId' : 'facebookId'
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                [socialField]: account.providerAccountId,
                emailVerified: new Date(),
                avatar: user.image
              }
            })
          } else {
            // Create new user with social account
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                avatar: user.image,
                emailVerified: new Date(),
                [account.provider === 'google' ? 'googleId' : 'facebookId']: account.providerAccountId,
                phone: '', // Will be added later if needed
                isActive: true
              }
            })
          }
        } catch (error) {
          console.error('Social sign-in error:', error)
          return false
        }
      }
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.phone = (user as any).phone
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.phone = token.phone
      }
      return session
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Log successful sign-in
      console.log(`User ${user.email || user.phone} signed in via ${account?.provider || 'credentials'}`)
      
      // Track user activity
      if (user.id) {
        await redisHelpers.setCache(`user:last_login:${user.id}`, new Date().toISOString(), 86400)
      }
    },

    async signOut({ token }) {
      // Clean up user sessions
      if (token.sub) {
        await redisHelpers.deleteCache(`user:last_login:${token.sub}`)
      }
    }
  },

  debug: process.env.NODE_ENV === 'development'
}

// Helper functions for authentication
export const authHelpers = {
  /**
   * Generate and send OTP
   */
  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate phone number
      if (!mimSMSService.isValidBangladeshPhone(phone)) {
        return { success: false, message: 'Invalid phone number format' }
      }

      // Check rate limit (3 OTPs per 5 minutes)
      const rateLimitKey = `otp_rate_limit:${phone}`
      const canSend = await redisHelpers.checkRateLimit(rateLimitKey, 3, 300)
      if (!canSend) {
        return { success: false, message: 'Too many OTP requests. Please try again later.' }
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      // Store OTP in Redis (5 minutes expiry)
      await redisHelpers.setOTP(phone, otp, 5)

      // Send OTP via SMS
      const smsResult = await mimSMSService.sendOTP(phone, otp)
      
      if (smsResult.statusCode === '200') {
        return { success: true, message: 'OTP sent successfully' }
      } else {
        return { success: false, message: 'Failed to send OTP' }
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      return { success: false, message: 'Failed to send OTP' }
    }
  },

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const storedOTP = await redisHelpers.getOTP(phone)
      
      if (!storedOTP) {
        return { success: false, message: 'OTP expired or not found' }
      }

      if (storedOTP !== otp) {
        return { success: false, message: 'Invalid OTP' }
      }

      // OTP is valid, delete it
      await redisHelpers.deleteOTP(phone)
      return { success: true, message: 'OTP verified successfully' }
    } catch (error) {
      console.error('Verify OTP error:', error)
      return { success: false, message: 'Failed to verify OTP' }
    }
  },

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  },

  /**
   * Verify password
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  },

  /**
   * Check if user is admin
   */
  isAdmin(user: any): boolean {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  },

  /**
   * Check if user is super admin
   */
  isSuperAdmin(user: any): boolean {
    return user?.role === 'SUPER_ADMIN'
  }
}
