from aiokafka import AIOKafkaProducer, AIOKafkaConsumer

async def get_producer(bootstrap_servers: str):
    producer = AIOKafkaProducer(bootstrap_servers=bootstrap_servers)
    await producer.start()
    return producer

async def get_consumer(topic: str, bootstrap_servers: str):
    consumer = AIOKafkaConsumer(topic, bootstrap_servers=bootstrap_servers)
    await consumer.start()
    return consumer
