from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
import time
from datetime import datetime, timedelta
import tempfile
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")

client = OpenAI(api_key=api_key)
MODEL = "gpt-4o-mini"

def create_system_prompt(input_language, output_language):
    return f"""Translate the following **{input_language}** text into a format for language learners.
- For each line of input, keep the original sentence.
- After each phrase or logical chunk, add the **{output_language} translation in parentheses** immediately after it.
- Keep grammatical notes or meanings after a semicolon when useful.
- Preserve exact formatting and punctuation from the input. Do not merge or split lines.
- Example format (adapt to your language pair):
[Original phrase] ([translated phrase]) [next phrase] ([translated phrase])

Important guidelines:
1. Do not translate the entire sentence as one block
2. Break down into meaningful phrases or logical chunks
3. Add grammatical notes when helpful for learning
4. Preserve all formatting, punctuation, and line breaks
5. Do not add extra commentary or explanation
6. Focus on preserving structure and meaning for language learning

Translate each phrase naturally while maintaining the learning format."""


def build_messages(text, input_language, output_language):
    system_prompt = create_system_prompt(input_language, output_language)
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f'Please convert the following text:\n\n{text}'}
    ]

def translate_text(text, input_language, output_language):
    response = client.chat.completions.create(
        model=MODEL,
        messages=build_messages(text, input_language, output_language),
        temperature=0.2
    )
    return response.choices[0].message.content.strip()

def bar(total, current):
    percent = int((current / total) * 100)
    done = percent // 2
    return f"[{'#' * done}{'-' * (50 - done)}] {percent}%"

@app.route('/translate', methods=['POST'])
def translate_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400


    source_language = request.form.get('sourceLanguage', 'German')
    target_language = request.form.get('targetLanguage', 'Ukrainian')
    
    if not source_language or not target_language:
        return jsonify({'error': 'Source and target languages are required'}), 400
    
    if source_language == target_language:
        return jsonify({'error': 'Source and target languages must be different'}), 400

    def generate():
        try:
            file_content = file.read().decode('utf-8')
            text = [line.strip() for line in file_content.split('\n') if line.strip()]
            length = len(text)
            
            start_time = time.time()
            translated_lines = []
            for index, chunk in enumerate(text):
                elapsed = time.time() - start_time
                remaining = length - (index + 1)
                est_total_time = elapsed / (index + 1) * length if index > 0 else 0
                est_remaining_time = est_total_time - elapsed
                

                progress_data = {
                    'type': 'progress',
                    'current': index + 1,
                    'total': length,
                    'percentage': int((index + 1) / length * 100),
                    'eta': (datetime.now() + timedelta(seconds=est_remaining_time)).strftime("%H:%M") if est_remaining_time > 0 else "00:00"
                }
                yield f"data: {json.dumps(progress_data)}\n\n"
                
                chunk = chunk.replace('\n', ' ')
                result = translate_text(chunk, source_language, target_language)
                
                formatted_result = result.replace('\n', ' ') + '\n\n' + chunk + '\n\n'
                translated_lines.append(formatted_result)
                line_data = {
                    'type': 'line',
                    'index': index,
                    'original': chunk,
                    'translated': result,
                    'result': formatted_result
                }
                yield f"data: {json.dumps(line_data)}\n\n"
            

            completion_data = {
                'type': 'complete',
                'fullText': ''.join(translated_lines),
                'totalLines': length
            }
            yield f"data: {json.dumps(completion_data)}\n\n"
            
        except Exception as e:
            error_data = {
                'type': 'error',
                'message': str(e)
            }
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    debug = os.getenv('NODE_ENV', 'development') == 'development'
    app.run(debug=debug, host=host, port=port)
