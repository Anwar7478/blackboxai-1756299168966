import axios from 'axios'

interface MimSMSConfig {
  username: string
  apiKey: string
  senderName: string
  baseUrl: string
}

interface SMSResponse {
  statusCode: string
  status: string
  trxnId?: string
  responseResult: string
}

interface SendSMSParams {
  mobileNumber: string
  message: string
  transactionType?: 'T' | 'P' | 'D' // T: Transactional, P: Promotional, D: Dynamic
  campaignId?: string
}

class MimSMSService {
  private config: MimSMSConfig

  constructor() {
    this.config = {
      username: process.env.MIMSMS_USERNAME || '',
      apiKey: process.env.MIMSMS_API_KEY || '',
      senderName: process.env.MIMSMS_SENDER_NAME || 'Heriken',
      baseUrl: 'https://api.mimsms.com'
    }

    if (!this.config.username || !this.config.apiKey) {
      console.warn('MIMSMS credentials not configured')
    }
  }

  /**
   * Send single SMS
   */
  async sendSMS(params: SendSMSParams): Promise<SMSResponse> {
    try {
      const payload = {
        UserName: this.config.username,
        Apikey: this.config.apiKey,
        MobileNumber: this.formatPhoneNumber(params.mobileNumber),
        CampaignId: params.campaignId || 'null',
        SenderName: this.config.senderName,
        TransactionType: params.transactionType || 'T',
        Message: params.message
      }

      const response = await axios.post(
        `${this.config.baseUrl}/api/SmsSending/SMS`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      )

      return response.data as SMSResponse
    } catch (error) {
      console.error('MIMSMS Error:', error)
      throw new Error('Failed to send SMS')
    }
  }

  /**
   * Send OTP SMS
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<SMSResponse> {
    const message = `আপনার Heriken যাচাইকরণ কোড: ${otp}। এই কোডটি ৫ মিনিটের জন্য বৈধ। কোডটি কারো সাথে শেয়ার করবেন না।`
    
    return this.sendSMS({
      mobileNumber: phoneNumber,
      message,
      transactionType: 'T'
    })
  }

  /**
   * Send order confirmation SMS
   */
  async sendOrderConfirmation(
    phoneNumber: string, 
    orderNumber: string, 
    totalAmount: number,
    prepaidAmount: number = 0,
    codAmount: number = 0
  ): Promise<SMSResponse> {
    let message = `আপনার অর্ডার #${orderNumber} নিশ্চিত হয়েছে। মোট: ৳${totalAmount}`
    
    if (prepaidAmount > 0) {
      message += `, অগ্রিম পেমেন্ট: ৳${prepaidAmount}`
    }
    
    if (codAmount > 0) {
      message += `, ক্যাশ অন ডেলিভারি: ৳${codAmount}`
    }
    
    message += `। ধন্যবাদ - Heriken`

    return this.sendSMS({
      mobileNumber: phoneNumber,
      message,
      transactionType: 'T'
    })
  }

  /**
   * Send payment received SMS
   */
  async sendPaymentReceived(
    phoneNumber: string,
    orderNumber: string,
    amount: number,
    paymentMethod: string
  ): Promise<SMSResponse> {
    const message = `আপনার অর্ডার #${orderNumber} এর ৳${amount} টাকা ${paymentMethod} এর মাধ্যমে সফলভাবে পেমেন্ট হয়েছে। ধন্যবাদ - Heriken`

    return this.sendSMS({
      mobileNumber: phoneNumber,
      message,
      transactionType: 'T'
    })
  }

  /**
   * Send order shipped SMS
   */
  async sendOrderShipped(
    phoneNumber: string,
    orderNumber: string,
    trackingNumber?: string,
    trackingUrl?: string
  ): Promise<SMSResponse> {
    let message = `আপনার অর্ডার #${orderNumber} পাঠানো হয়েছে।`
    
    if (trackingNumber) {
      message += ` ট্র্যাকিং নম্বর: ${trackingNumber}`
    }
    
    if (trackingUrl) {
      message += ` ট্র্যাক করুন: ${trackingUrl}`
    }
    
    message += ` - Heriken`

    return this.sendSMS({
      mobileNumber: phoneNumber,
      message,
      transactionType: 'T'
    })
  }

  /**
   * Send order delivered SMS
   */
  async sendOrderDelivered(
    phoneNumber: string,
    orderNumber: string
  ): Promise<SMSResponse> {
    const message = `আপনার অর্ডার #${orderNumber} সফলভাবে ডেলিভার হয়েছে। Heriken এর সাথে কেনাকাটার জন্য ধন্যবাদ!`

    return this.sendSMS({
      mobileNumber: phoneNumber,
      message,
      transactionType: 'T'
    })
  }

  /**
   * Send preorder release notification
   */
  async sendPreorderRelease(
    phoneNumber: string,
    productName: string,
    orderNumber?: string
  ): Promise<SMSResponse> {
    let message = `সুখবর! আপনার প্রি-অর্ডার পণ্য "${productName}" এখন উপলব্ধ।`
    
    if (orderNumber) {
      message += ` অর্ডার #${orderNumber}`
    }
    
    message += ` - Heriken`

    return this.sendSMS({
      mobileNumber: phoneNumber,
      message,
      transactionType: 'T'
    })
  }

  /**
   * Send multiple SMS (One to Many)
   */
  async sendBulkSMS(
    phoneNumbers: string[],
    message: string,
    transactionType: 'T' | 'P' = 'P'
  ): Promise<SMSResponse> {
    try {
      const formattedNumbers = phoneNumbers.map(num => this.formatPhoneNumber(num)).join(',')
      
      const payload = {
        UserName: this.config.username,
        Apikey: this.config.apiKey,
        MobileNumber: formattedNumbers,
        CampaignId: 'null',
        SenderName: this.config.senderName,
        TransactionType: transactionType,
        Message: message
      }

      const response = await axios.post(
        `${this.config.baseUrl}/api/SmsSending/OneToMany`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000
        }
      )

      return response.data as SMSResponse
    } catch (error) {
      console.error('MIMSMS Bulk Error:', error)
      throw new Error('Failed to send bulk SMS')
    }
  }

  /**
   * Check account balance
   */
  async checkBalance(): Promise<{ balance: number; status: string }> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/api/SmsSending/balanceCheck`,
        {
          UserName: this.config.username,
          Apikey: this.config.apiKey
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      )

      return {
        balance: parseFloat(response.data.responseResult || '0'),
        status: response.data.status
      }
    } catch (error) {
      console.error('MIMSMS Balance Check Error:', error)
      throw new Error('Failed to check SMS balance')
    }
  }

  /**
   * Format phone number to Bangladesh format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '')
    
    // Handle different formats
    if (cleaned.startsWith('880')) {
      return cleaned // Already in international format
    } else if (cleaned.startsWith('0')) {
      return '88' + cleaned // Add country code
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return '880' + cleaned // Add country code for 11-digit numbers starting with 1
    } else if (cleaned.length === 10) {
      return '8801' + cleaned // Add country code and leading 1
    }
    
    return cleaned
  }

  /**
   * Validate Bangladesh phone number
   */
  isValidBangladeshPhone(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber)
    // Bangladesh mobile numbers: 880 + 1 + (3|4|5|6|7|8|9) + 8 digits
    const regex = /^880[1][3-9]\d{8}$/
    return regex.test(formatted)
  }
}

export const mimSMSService = new MimSMSService()
export default mimSMSService
