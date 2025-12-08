import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function checkStorageSetup() {
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return { success: false, error: bucketsError }
    }

    console.log('Available buckets:', buckets)

    // Check if avatars bucket exists
    const avatarsBucket = buckets?.find(b => b.name === 'avatars')
    
    if (!avatarsBucket) {
      console.error('❌ Avatars bucket not found!')
      console.log('Please create the avatars bucket in Supabase Dashboard')
      console.log('See SUPABASE_STORAGE_SETUP.md for instructions')
      return { success: false, error: 'Avatars bucket not found' }
    }

    console.log('✅ Avatars bucket found!')
    console.log('Bucket details:', avatarsBucket)

    return { success: true, bucket: avatarsBucket }
  } catch (error) {
    console.error('Error checking storage setup:', error)
    return { success: false, error }
  }
}
