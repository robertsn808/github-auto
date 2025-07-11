FROM python:3.12-slim

WORKDIR /app/src
COPY requirements.txt /app/requirements.txt
COPY src /app/src

RUN pip install --no-cache-dir -r /app/requirements.txt

ENV FLASK_APP=main:app
ENV FLASK_ENV=development
ENV PYTHONPATH=/app/src

CMD ["flask", "run", "--host=0.0.0.0", "--port=8000"]
