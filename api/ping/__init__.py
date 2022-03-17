import logging
from datetime import datetime

import azure.functions as func

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")

    return func.HttpResponse(f"Current time: {current_time}")
   
