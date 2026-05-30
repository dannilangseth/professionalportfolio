import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1-P33-AjFFdhllHJIfazYZSNdEX8ByOqXxP-CDi9appo'

// The 81 hotels confirmed ✓ Sent in the batch where sheet update silently failed.
// Matched against column D (Entity Name) in the sheet.
const SENT_HOTEL_NAMES = new Set([
  'View Point Resort',
  'Santhiya',
  'Mandarin Oriental, Bangkok',
  'Layana',
  'Jamahkiri',
  'Cape Shark Villas',
  'Zannier Phum Baitang',
  'WAKA VILLA Private Resort & Spa',
  'Viroth\'s Hotel',
  'Villa Santi Hotel',
  'Villa Maly',
  'ViengTara Resort',
  'Victoria Xiengthong Palace',
  'Veranda Natural Resort',
  'U Luang Prabang',
  'TUI BLUE Angkor Grace',
  'Tree Line Hotel',
  'The Royal Sands Koh Rong',
  'The Namkhan',
  'The Luang Say Residence',
  'The Grand Luang Prabang',
  'The Belle Rive Boutique Hotel',
  'The Balé Phnom Penh',
  'The Apsara Rive Droite',
  'Templation',
  'Souphattra Hotel',
  'Sokha Angkor Resort',
  'Sofitel Angkor Phokeethra Golf & Spa Resort',
  'Six Senses Krabey Island',
  'Shintana Saya La Maison',
  'Shangri-La Phnom Penh',
  'Senesothxuen Hotel',
  'Savan Resorts',
  'Satri House',
  'Samanea Beach Resort & Spa',
  'Rosewood',
  'Raffles Grand Hotel d\'Angkor',
  'Queenco Entertainment Resort',
  'Pullman',
  'PHA NYA RESIDENCE',
  'My Ban Lao',
  'Mekong Riverview Hotel',
  'Mane History Lovers',
  'Luang Say Lodge',
  'Luang Prabang View Hotel',
  'Le Bel Air Resort',
  'Lao Plaza Hotel',
  'La Sen Boutique Hotel',
  'La Seine Boutique',
  'La Résidence Phou Vao',
  'La Mamounia',
  'Koh Russey Resort',
  'Knai Bang Chatt Resort in Kep',
  'Kiridara Hotel',
  'Jaya House River Park Hotel',
  'JATI Koh Russey',
  'Houngvilai Hotel Luangprabang',
  'Hotel VELA Dhi Nakhon Phanom',
  'Choasis Hotel',
  'Castle Bayview Resort & Spa',
  'Burasari Heritage',
  'Avani',
  'Angkor Palace Resort & Spa',
  'Anantara Angkor Resort',
  'Amber Kampot',
  'Amantaka',
  'Amansara',
  '3 Nagas Hotel',
  'Zazen Boutique Resort',
  'Volcano Views Glamping',
  'Volcano Lodge, Hotel & Thermal Experience',
  'Vista del Alma Boutique',
  'Ventura Santa Teresa',
  'Valle Escondido Nature Reserve',
  'Trapp Family Lodge',
  'Tifakara Boutique Hotel',
  'The Tubkaak Krabi Boutique Resort',
  'The Springs Resort & Spa at Arenal',
  'The Slate Phuket',
  'The Bach Suites Saigon',
])

// Date the batch was actually sent
const SENT_DATE = '2026-05-30'

export async function POST() {
  try {
    const { google } = await import('googleapis')

    const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\\\n/g, '\\n').replace(/\\n/g, '\n')
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })

    // Read the full sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:L',
    })
    const rows = response.data.values ?? []

    const updates: { range: string; values: string[][] }[] = []
    const matched: string[] = []
    const alreadyMarked: string[] = []
    const notFound: string[] = [...SENT_HOTEL_NAMES]  // start full, remove as found

    rows.forEach((row, idx) => {
      const hotelName = (row[3] ?? '').toString().trim()
      const followUp1Sent = (row[11] ?? '').toString().trim()

      if (!SENT_HOTEL_NAMES.has(hotelName)) return

      // Remove from notFound tracking (handle duplicates like Volcano Views Glamping)
      const nfIdx = notFound.indexOf(hotelName)
      if (nfIdx !== -1) notFound.splice(nfIdx, 1)

      if (followUp1Sent !== '') {
        alreadyMarked.push(`${hotelName} (row ${idx + 1}, existing: ${followUp1Sent})`)
        return
      }

      const rowNum = idx + 1
      updates.push({ range: `Sheet1!L${rowNum}`, values: [[SENT_DATE]] })
      matched.push(`${hotelName} → row ${rowNum}`)
    })

    let writeResult = 'no updates needed'
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updates,
        },
      })
      writeResult = `wrote ${updates.length} rows`
    }

    return NextResponse.json({
      success: true,
      writeResult,
      markedNow: matched.length,
      alreadyMarked: alreadyMarked.length,
      notFoundInSheet: notFound.length,
      details: { matched, alreadyMarked, notFound },
    })
  } catch (err) {
    console.error('[repair-l]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
