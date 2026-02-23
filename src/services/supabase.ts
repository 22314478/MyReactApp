import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';

// Get these from the Supabase dashboard
const supabaseUrl = 'https://vaqzzrrfdfapdqgcedee.supabase.co';
const supabaseAnonKey = 'sb_publishable_N2tdzaEs0G6sDzFuOORlyA_XlrqQ50J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a base64 encoded image to Supabase Storage and returns the public URL.
 * @param uri Local file URI from ImagePicker (used for extraction)
 * @param base64 The raw base64 string of the image
 * @param bucketName Name of the storage bucket ('images')
 * @returns Public URL of the uploaded image
 */
export const uploadImageToSupabase = async (uri: string, base64: string, bucketName: string = 'images'): Promise<string | null> => {
    try {
        const ext = uri.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = `requests/${fileName}`; // Organizes uploads in a 'requests' folder

        // Decode the base64 string into an ArrayBuffer (Uint8Array)
        // This is the most reliable method for React Native -> Supabase storage.
        const fileData = decode(base64);

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileData, {
                contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
            });

        if (error) {
            console.error('Supabase upload error:', error.message);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image to Supabase:', error);
        return null;
    }
};
