#!/usr/bin/env python3
'''simple helper function'''
from typing import Tuple


def index_range(page: int, page_size: int) -> Tuple:
    '''function that returns two integers
    containing start index and end index'''
    end_index = page_size * page
    start_index = end_index - page_size
    return (start_index, end_index)
