import nodemailer from 'nodemailer'

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount()
  
  console.log('\n=== Ethereal Email Account Created ===\n')
  console.log('Add these to your .env file:\n')
  console.log(`EMAIL_HOST=smtp.ethereal.email`)
  console.log(`EMAIL_PORT=587`)
  console.log(`EMAIL_USER=${testAccount.user}`)
  console.log(`EMAIL_PASS=${testAccount.pass}`)
  console.log('\nEmails will be caught at: https://ethereal.email/messages')
}

createTestAccount()

