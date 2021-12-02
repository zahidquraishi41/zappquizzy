import enum
from . import scrapper
from .database import ScrapperDB
import os
import time
from typing import Any, Iterable

'''Kind of a high level module for connecting app.py with (database.py and scrapper.py)'''


def pause():
    os.system('pause')


def display(message: Any, delay: int = 2.0):
    try:
        print(message)
        time.sleep(delay)
    except:
        pass


def clear_screen():
    os.system('cls')


def is_int(o: Any) -> bool:
    '''Returns True if 'o' is a number'''
    try:
        int(o)
        return True
    except:
        return False


def search(itr: Iterable, elem: object, case_sensitive: bool = False) -> object:
    '''Returns first matching object on the list'''
    if case_sensitive:
        for item in itr:
            if item == elem:
                return item
    else:
        for item in itr:
            if item.lower() == elem.lower():
                return item
    return None


def refresh(category: str, topic: str, chapter: str, sections: list[str]):
    '''Adds any new category, topic, chapter or sections added from website to database.'''
    print('updating.', end='')
    out = scrapper.scrap_categories()
    with ScrapperDB() as db:
        db.add_categories(out)
    # performing too many operations might block request so waiting for a sec
    time.sleep(1)

    print('updating..', end='')
    with ScrapperDB() as db:
        topic_url = db._get_topic_url(topic, category)
    out = scrapper.scrap_chapters(topic_url)
    with ScrapperDB() as db:
        db.add_chapters(topic_url, out)
    time.sleep(1)

    print('updating...', end='')
    section_urls = []
    with ScrapperDB() as db:
        for section in sections:
            section_url = db._get_section_url(section, chapter,
                                              topic, category)
            section_urls.append(section_url)
    outs = []
    for section_url in section_urls:
        out = scrapper.scrap_section(section_url)
        outs.append(out)
        time.sleep(0.5)
    with ScrapperDB() as db:
        for out in outs:
            db.add_section(section_url, out)


def get_categories() -> list[str]:
    '''Returns categories from database if exists otherwise scraps it, save it to database and returns it.'''
    with ScrapperDB() as db:
        cats = db.get_categories()
    if not cats:
        out = scrapper.scrap_categories()
        with ScrapperDB() as db:
            db.add_categories(out)
            cats = db.get_categories()
    return cats


def get_topics(category: str) -> list[str]:
    '''Returns topics from database.'''
    with ScrapperDB() as db:
        return db.get_topics(category)


def get_chapters(topic: str, category: str) -> list[str]:
    '''Returns chapters from database if exists otherwise scraps it, save it to database and returns it.'''
    with ScrapperDB() as db:
        chaps = db.get_chapters(topic, category)
        if chaps:
            return chaps
        topic_url = db._get_topic_url(topic, category)
    out = scrapper.scrap_chapters(topic_url)
    with ScrapperDB() as db:
        db.add_chapters(topic_url, out)
        return db.get_chapters(topic, category)


def get_sections(chapter: str, topic: str, category: str) -> list[str]:
    '''Returns sections from database.'''
    with ScrapperDB() as db:
        return db.get_sections(chapter, topic, category)


def get_questions(section, chapter, topic, category) -> list[tuple[str, str, str, str]]:
    '''Returns chapters from database if exists otherwise scraps it, save it to database and returns it.'''
    with ScrapperDB() as db:
        questions = db.get_questions(section, chapter, topic, category)
        if questions:
            return questions
        section_url = db._get_section_url(section, chapter, topic, category)
    out = scrapper.scrap_section(section_url)
    with ScrapperDB() as db:
        db.add_section(section_url, out)
        return db.get_questions(section, chapter, topic, category)


def select_option(items: list[str], sp_commands: list[str] = [], message: str = 'Enter your choice: ', header: str = None) -> str:
    '''Prompts user to select a option from given list.'''
    max_len_option = len(
        str(len(items)))  # for padding option number with zero
    while True:
        clear_screen()
        if header:
            print(header)
        for i, item in enumerate(items):
            padded_i = str(i+1).rjust(max_len_option, '0')
            print(f'[{padded_i}] {item}')
        inp = input(message)
        if not inp:
            continue
        inp = inp.lstrip('0')
        if search(sp_commands, inp):
            return search(sp_commands, inp)
        if is_int(inp):
            inp = int(inp)
            if inp > 0 and inp <= len(items):
                return items[inp - 1]
        display(f'Enter a number between 1 to {len(items)}.')


def select_options(items: list[str], sp_commands: list[str] = [], default_selections: list[str] = [], message: str = 'select an option: ', min_selection: int = 1, header: str = None) -> list[str]:
    '''Prompts user to select multiple option from given list.'''
    selected_items = []
    selected_items.extend(default_selections)
    max_len_section = len(max(items, key=len)) + 3
    max_len_option = len(str(len(items)))

    def selected(item: str) -> str:
        return 'Selected' if item in selected_items else 'Not Selected'

    while True:
        clear_screen()
        if header:
            print(header)
        for i, section in enumerate(items):
            padded_i = str(i+1).rjust(max_len_option, '0')
            print(
                f'[{padded_i}] {section.ljust(max_len_section)}\t[{selected(section)}]')
        print(f'[a] Select All')
        print(f'[b] Deselect All')
        print(f'[c] Continue')

        inp = input(message)
        if not inp:
            continue
        inp = inp.lstrip('0')
        if inp == 'a':
            selected_items.clear()
            selected_items.extend(items)
            continue
        if inp == 'b':
            selected_items.clear()
            continue
        if inp == 'c':
            if len(selected_items) < min_selection:
                display(
                    f'Select at least {min_selection} list item to continue.')
                continue
            else:
                return selected_items

        if search(sp_commands, inp):
            return search(sp_commands, inp)
        if is_int(inp):
            inp = int(inp)
            if inp > 0 and inp <= len(items):
                item = items[inp - 1]
                selected_items.remove(
                    item) if item in selected_items else selected_items.append(item)
                continue
        display(f'Enter a number between 1 to {len(items)}')


def split_options(options: str) -> list[str]:
    choices = []
    try:
        for option in options.split('\n'):
            if option.startswith(('a)', 'b)', 'c)', 'd)')):
                choices.append(option)
            else:
                choices.append(choices.pop() + '<br>' + option)
    except:
        choices.clear()
    if choices:
        return choices
    return [options]


def code_formatter(code: str) -> str:
    formatted = []
    # removing '{' from new line and putting it to function declaration line
    for block in code.split('\n'):
        if block == '{' and formatted:
            formatted.append(formatted.pop() + block)
        else:
            formatted.append(block)

    # indenting code blocks with 3 spaces
    for i, block in enumerate(formatted):
        if block and block.strip()[-1] == '{':
            j = i + 1
            while j < len(formatted):
                if formatted[j] and formatted[j][-1] == '}':
                    break
                formatted[j] = '&nbsp;' * 3 + formatted[j]
                j += 1

    return '<br>'.join(formatted)


def to_dict(section_name, questions: list[tuple[str, str, str, str]]) -> dict:
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
