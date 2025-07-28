import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();
    
    if (!text?.trim()) {
      return Response.json({ transformed: text || '' });
    }

    const result = await generateText({
      model: myProvider.languageModel('chat-model'),
      system: 'Fix spelling and grammar. Make it natural English. Keep the same meaning. Return ONLY the corrected text.',
      prompt: text,
    });

    return Response.json({ transformed: result.text.trim() });

  } catch (error) {
    const { text } = await request.json().catch(() => ({ text: '' }));
    return Response.json({ transformed: text });
  }
} 