// utils/encryption.ts
import { Buffer } from 'buffer';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY!;

export async function encrypt(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(ENCRYPTION_KEY),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    const encryptedArray = new Uint8Array(encrypted);
    const buffer = Buffer.from(new Uint8Array([...iv, ...encryptedArray]));

    return buffer.toString('base64');
}
