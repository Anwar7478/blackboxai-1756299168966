import axios from 'axios'

interface BkashConfig {
  username: string
  password: string
  appKey: string
  appSecret: string
  baseUrl: string
}

interface BkashTokenResponse {
  statusCode: string
  statusMessage: string
  id_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

interface CreatePaymentRequest {
  mode: '0011' | '0001' // 0011 for checkout, 0001 for payment
  payerReference: string
  callbackURL: string
  amount: string
  currency: 'BDT'
  intent: 'sale'
  merchantInvoiceNumber: string
}

interface CreatePaymentResponse {
  statusCode: string
  statusMessage: string
  paymentID: string
  bkashURL: string
  callbackURL: string
  successCallbackURL: string
  failureCallbackURL: string
  cancelledCallbackURL: string
  amount: string
  intent: string
  currency: string
}

interface ExecutePaymentRequest {
  paymentID: string
}

interface ExecutePaymentResponse {
  statusCode: string
  statusMessage: string
  paymentID: string
  trxID: string
  transactionStatus: string
  amount: string
  currency: string
  intent: string
  paymentExecuteTime: string
  merchantInvoiceNumber: string
  payerReference: string
}

interface QueryPaymentResponse {
  statusCode: string
  statusMessage: string
  paymentID: string
  mode: string
  trxID: string
  transactionStatus: string
  amount: string
  currency: string
  intent: string
  paymentCreateTime: string
  paymentExecuteTime: string
  merchantInvoiceNumber: string
  payerReference: string
}

interface RefundRequest {
  paymentID: string
  amount: string
  trxID: string
  sku: string
  reason: string
}

interface RefundResponse {
  statusCode: string
  statusMessage: string
  refundTrxID: string
  originalTrxID: string
  amount: string
  currency: string
  charge: string
  refundTime: string
}

class BkashService {
  private config: BkashConfig
  private token: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.config = {
      username: process.env.BKASH_USERNAME || '',
      password: process.env.BKASH_PASSWORD || '',
      appKey: process.env.BKASH_APP_KEY || '',
      appSecret: process.env.BKASH_APP_SECRET || '',
      baseUrl: process.env.BKASH_BASE_URL || 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout'
    }

    if (!this.config.username || !this.config.password || !this.config.appKey || !this.config.appSecret) {
      console.warn('bKash credentials not configured')
    }
  }

  /**
   * Get access token
   */
  private async getToken(): Promise<string> {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token
    }

    try {
      const response = await axios.post<BkashTokenResponse>(
        `${this.config.baseUrl}/token/grant`,
        {
          app_key: this.config.appKey,
          app_secret: this.config.appSecret
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'username': this.config.username,
            'password': this.config.password
          }
        }
      )

      if (response.data.statusCode === '0000') {
        this.token = response.data.id_token
        // Set expiry to 5 minutes before actual expiry for safety
        this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000)
        return this.token
      } else {
        throw new Error(`Token grant failed: ${response.data.statusMessage}`)
      }
    } catch (error) {
      console.error('bKash Token Error:', error)
      throw new Error('Failed to get bKash token')
    }
  }

  /**
   * Create payment
   */
  async createPayment(params: {
    amount: number
    orderNumber: string
    customerPhone?: string
    callbackURL: string
  }): Promise<CreatePaymentResponse> {
    try {
      const token = await this.getToken()

      const payload: CreatePaymentRequest = {
        mode: '0011', // Checkout mode
        payerReference: params.customerPhone || '',
        callbackURL: params.callbackURL,
        amount: params.amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: params.orderNumber
      }

      const response = await axios.post<CreatePaymentResponse>(
        `${this.config.baseUrl}/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authorization': token,
            'x-app-key': this.config.appKey
          }
        }
      )

      if (response.data.statusCode === '0000') {
        return response.data
      } else {
        throw new Error(`Payment creation failed: ${response.data.statusMessage}`)
      }
    } catch (error) {
      console.error('bKash Create Payment Error:', error)
      throw new Error('Failed to create bKash payment')
    }
  }

  /**
   * Execute payment
   */
  async executePayment(paymentID: string): Promise<ExecutePaymentResponse> {
    try {
      const token = await this.getToken()

      const payload: ExecutePaymentRequest = {
        paymentID
      }

      const response = await axios.post<ExecutePaymentResponse>(
        `${this.config.baseUrl}/execute`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authorization': token,
            'x-app-key': this.config.appKey
          }
        }
      )

      if (response.data.statusCode === '0000') {
        return response.data
      } else {
        throw new Error(`Payment execution failed: ${response.data.statusMessage}`)
      }
    } catch (error) {
      console.error('bKash Execute Payment Error:', error)
      throw new Error('Failed to execute bKash payment')
    }
  }

  /**
   * Query payment status
   */
  async queryPayment(paymentID: string): Promise<QueryPaymentResponse> {
    try {
      const token = await this.getToken()

      const response = await axios.post<QueryPaymentResponse>(
        `${this.config.baseUrl}/payment/status`,
        { paymentID },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authorization': token,
            'x-app-key': this.config.appKey
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('bKash Query Payment Error:', error)
      throw new Error('Failed to query bKash payment')
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(params: {
    paymentID: string
    trxID: string
    amount: number
    reason: string
    sku?: string
  }): Promise<RefundResponse> {
    try {
      const token = await this.getToken()

      const payload: RefundRequest = {
        paymentID: params.paymentID,
        amount: params.amount.toFixed(2),
        trxID: params.trxID,
        sku: params.sku || 'refund',
        reason: params.reason
      }

      const response = await axios.post<RefundResponse>(
        `${this.config.baseUrl}/payment/refund`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authorization': token,
            'x-app-key': this.config.appKey
          }
        }
      )

      if (response.data.statusCode === '0000') {
        return response.data
      } else {
        throw new Error(`Refund failed: ${response.data.statusMessage}`)
      }
    } catch (error) {
      console.error('bKash Refund Error:', error)
      throw new Error('Failed to process bKash refund')
    }
  }

  /**
   * Search transaction
   */
  async searchTransaction(trxID: string): Promise<any> {
    try {
      const token = await this.getToken()

      const response = await axios.post(
        `${this.config.baseUrl}/general/searchTransaction`,
        { trxID },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'authorization': token,
            'x-app-key': this.config.appKey
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('bKash Search Transaction Error:', error)
      throw new Error('Failed to search bKash transaction')
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<BkashTokenResponse> {
    try {
      const response = await axios.post<BkashTokenResponse>(
        `${this.config.baseUrl}/token/refresh`,
        {
          app_key: this.config.appKey,
          app_secret: this.config.appSecret,
          refresh_token: refreshToken
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'username': this.config.username,
            'password': this.config.password
          }
        }
      )

      if (response.data.statusCode === '0000') {
        this.token = response.data.id_token
        this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000)
        return response.data
      } else {
        throw new Error(`Token refresh failed: ${response.data.statusMessage}`)
      }
    } catch (error) {
      console.error('bKash Refresh Token Error:', error)
      throw new Error('Failed to refresh bKash token')
    }
  }

  /**
   * Validate webhook signature (if bKash provides webhook functionality)
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    // Implementation depends on bKash webhook signature algorithm
    // This is a placeholder - implement based on bKash documentation
    return true
  }

  /**
   * Get payment URL for redirect
   */
  getPaymentUrl(bkashURL: string): string {
    return bkashURL
  }

  /**
   * Format amount for bKash (ensure 2 decimal places)
   */
  formatAmount(amount: number): string {
    return amount.toFixed(2)
  }

  /**
   * Check if payment is successful
   */
  isPaymentSuccessful(statusCode: string): boolean {
    return statusCode === '0000'
  }

  /**
   * Get error message from status code
   */
  getErrorMessage(statusCode: string, statusMessage: string): string {
    const errorCodes: { [key: string]: string } = {
      '0001': 'Insufficient Balance',
      '0002': 'Transaction Limit Exceeded',
      '0003': 'Invalid Merchant',
      '0004': 'Invalid Amount',
      '0005': 'Transaction Failed',
      '0006': 'Transaction Cancelled',
      '0007': 'Invalid Request',
      '0008': 'Duplicate Transaction',
      '0009': 'System Error',
      '0010': 'Invalid Token'
    }

    return errorCodes[statusCode] || statusMessage || 'Unknown error occurred'
  }
}

export const bkashService = new BkashService()
export default bkashService
