import asyncio
import edge_tts

async def main():
    with open('public/voiceover_urdu.txt', encoding='utf-8') as f:
        text = f.read()
    communicate = edge_tts.Communicate(text, 'ur-PK-AsadNeural')
    await communicate.save('public/voiceover_urdu.mp3')
    print('Voiceover saved')

asyncio.run(main())
