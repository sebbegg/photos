import sys
import logging

from .config import LOGLEVEL

logging.basicConfig(
    stream=sys.stdout, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logging.getLogger("photos").setLevel(LOGLEVEL)
