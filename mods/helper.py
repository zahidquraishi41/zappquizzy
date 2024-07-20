from .database import ScrapperDB
from typing import List, Tuple, Dict
'''Kind of a high level module for connecting app.py with (database.py and scrapper.py)'''


def get_categories() -> List[str]:
    '''Returns categories from database if exists otherwise scraps it, save it to database and returns it.'''
    with ScrapperDB() as db:
        return db.get_categories()


def get_topics(category: str) -> List[str]:
    '''Returns topics from database.'''
    with ScrapperDB() as db:
        return db.get_topics(category)


def get_chapters(topic: str, category: str) -> List[str]:
    '''Returns chapters from database if exists otherwise scraps it, save it to database and returns it.'''
    with ScrapperDB() as db:
        return db.get_chapters(topic, category)


def get_sections(chapter: str, topic: str, category: str) -> List[str]:
    '''Returns sections from database.'''
    with ScrapperDB() as db:
        return db.get_sections(chapter, topic, category)


def get_questions(section, chapter, topic, category) -> List[Tuple[str, str, str, str]]:
    '''Returns chapters from database if exists otherwise scraps it, save it to database and returns it.'''
    with ScrapperDB() as db:
        return db.get_questions(section, chapter, topic, category)


def split_options(options: str) -> List[str]:
    choices = []
    try:
        for option in options.split('\n'):
            if option.startswith(('a)', 'b)', 'c)', 'd)')):
                choices.append(option)
            else:
                choices.append(choices.pop() + '\n' + option)
    except:
        choices.clear()
    if choices:
        return choices
    return [options]


def code_formatter(code: str) -> str:
    formatted = []
    # removing '{' from new line and putting it to function declaration line
    for block in code.split('\n'):
        if block.strip() == '{' and formatted:
            formatted.append(formatted.pop() + ' {')
        elif block.strip() == '':
            continue
        else:
            formatted.append(block)

    # indenting code blocks with 3 spaces
    for i, block in enumerate(formatted):
        if block and block.strip() and block.strip()[-1] == '{':
            j = i + 1
            opened = 0
            while j < len(formatted):
                if formatted[j] and formatted[j].strip() and formatted[j].strip()[-1] == '{':
                    opened += 1
                if formatted[j].strip() and formatted[j].strip()[-1] == '}':
                    if opened == 0:
                        break
                    opened -= 1
                formatted[j] = ' ' * 3 + formatted[j]
                j += 1

    return '\n'.join(formatted)


def to_dict(section_name: str, questions: List[Tuple[str, str, str, str]]) -> Dict:
    '''takes output of helper.get_questions(...) and converts to dict'''
    d = {}
    d[section_name] = []
    for q, o, a, e in questions:
        qd = {
            'question': code_formatter(q),
            'options': split_options(o),
            'answer': a,
            'explanation': e
        }
        d[section_name].append(qd)
    return d
