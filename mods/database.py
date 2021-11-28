import sqlite3 as sql
import os
import pickle
from datetime import datetime


class ScrapperDB:
    '''Used for storing data returned by scrapper module.
    Use this class with context manager. eg,
        with ScrapperDB() as db:
            cats = db.get_categories()'''
    __dbpath = 'cache.db'

    def __enter__(self):
        self.__con = sql.Connection(self.__dbpath)
        self.__cur = self.__con.cursor()
        self.__create_tables()
        return self

    def __exit__(self, exc_type, exc_val, traceback):
        self.__con.close()

    def add_categories(self, out: dict):
        '''Takes output from scrapper.scrap_categories() and stores into database.'''
        if not out:
            return
        categories = list(out.keys())
        categories.sort()
        self.__cur = self.__con.cursor()
        for category in categories:
            self.__cur.execute('''INSERT OR IGNORE INTO categories VALUES (?)''',
                               (category, ))
        self.__con.commit()
        for category, topics in out.items():
            for topic_name, topic_url in topics.items():
                self.__cur.execute('''INSERT OR IGNORE INTO topics VALUES (?, ?, ?)''',
                                   (topic_name, topic_url, category))
        self.__con.commit()

    def add_chapters(self, topic_url: str, out: list[tuple[str, str, dict]]):
        '''This function is designed to add data scrapped using scrapper.scrap_chapters()
        NOTE an extra parameter topic_url is required'''
        if not (topic_url and out):
            return
        self.__cur = self.__con.cursor()
        for chapter_name, chapter_desc, sections in out:
            self.__cur.execute('''INSERT OR IGNORE INTO chapters (chapter_name, chapter_desc, topic_url) VALUES (?, ?, ?)''',
                               (chapter_name, chapter_desc, topic_url))
            chapter_id = self._get_chapter_id2(chapter_name, topic_url)
            if not chapter_id:
                continue
            for section_name, section_url in sections:
                self.__cur.execute('''INSERT OR IGNORE INTO sections (section_name, section_url, chapter_id) VALUES (?, ?, ?)''',
                                   (section_name, section_url, chapter_id))
        self.__con.commit()

    def add_section(self, section_url: str, out: list[tuple[str, str, str, str]]):
        '''This function takes output of scrapper.scrap_section() with extra parameter section_url'''
        if not (section_url and out):
            return
        for question, options, answer, explanation in out:
            self.__cur.execute('INSERT OR IGNORE INTO questions (question, options, answer, explanation, section_url) VALUES (?, ?, ?, ?, ?)',
                               (question, options, answer, explanation, section_url))
        self.__con.commit()

    def get_categories(self) -> list[str]:
        result = self.__cur.execute('''SELECT category_name from categories''')\
            .fetchall()
        categories = []
        for elem in result:
            categories.append(elem[0])
        return categories

    def get_topics(self, category: str) -> list[str]:
        result = self.__cur.execute('''SELECT topic_name from topics WHERE category_name=?''',
                                    (category, )).fetchall()
        topics = []
        for elem in result:
            topics.append(elem[0])
        return topics

    def get_chapters(self, topic: str, category: str) -> list[str]:
        chapters = []
        topic_url = self._get_topic_url(topic, category)
        if not topic_url:
            return chapters
        result = self.__cur.execute('''SELECT chapter_name from chapters WHERE topic_url=? ORDER BY chapter_id''',
                                    (topic_url, )).fetchall()
        for elem in result:
            chapters.append(elem[0])
        return chapters

    def get_sections(self, chapter: str, topic: str, category: str) -> list[str]:
        sections = []
        chapter_id = self._get_chapter_id1(chapter, topic, category)
        if not chapter_id:
            return sections
        result = self.__cur.execute('''SELECT section_name from sections WHERE chapter_id=? ORDER BY row_id''',
                                    (chapter_id, )).fetchall()
        for elem in result:
            sections.append(elem[0])
        return sections

    def get_questions(self, section: str, chapter: str, topic: str, category: str) -> list[tuple[str, str, str, str]]:
        section_url = self._get_section_url(section, chapter, topic, category)
        if not section_url:
            return []
        result = self.__cur.execute('''SELECT question, options, answer, explanation from questions WHERE section_url=? ORDER BY row_id''',
                                    (section_url, )).fetchall()
        return result

    def __create_tables(self):
        ''' row_id is used only for the purpose of getting data in the order they where added.
        By default fetchall() returns rows sorted by query key.''' 
        statements = (
            '''CREATE TABLE IF NOT EXISTS categories (
        category_name TEXT UNIQUE);''',

            '''CREATE TABLE IF NOT EXISTS topics (
        topic_name TEXT NOT NULL,
        topic_url TEXT NOT NULL,
        category_name TEXT REFERENCES categories(category_name),
        UNIQUE (topic_name, category_name));''',

            '''CREATE TABLE IF NOT EXISTS chapters (
        chapter_id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_name TEXT NOT NULL,
        chapter_desc TEXT NOT NULL,
        topic_url TEXT REFERENCES topics(topic_url),
        UNIQUE (chapter_name, topic_url));''',

            '''CREATE TABLE IF NOT EXISTS sections (
        row_id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_name TEXT NOT NULL,
        section_url TEXT NOT NULL,
        chapter_id INTEGER REFERENCES chapters(chapter_id),
        UNIQUE (section_name, chapter_id));''',

            '''CREATE TABLE IF NOT EXISTS questions (
        row_id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL UNIQUE,
        options TEXT NOT NULL,
        answer TEXT NOT NULL,
        explanation TEXT,
        section_url TEXT REFERENCES sections(section_url));''')
        for statement in statements:
            self.__cur.execute(statement)

    def _get_chapter_id1(self, chapter: str, topic: str, category: str) -> int:
        # python does not support method overloading so using 1 & 2 at end of function name.
        topic_url = self._get_topic_url(topic, category)
        return self._get_chapter_id2(chapter, topic_url)

    def _get_chapter_id2(self, chapter: str, topic_url: str) -> int:
        if not topic_url:
            return None
        result = self.__cur.execute('''SELECT chapter_id from chapters WHERE chapter_name=? AND topic_url=?''',
                                    (chapter, topic_url)).fetchone()
        if result:
            result = result[0]
        return result

    def _get_topic_url(self, topic: str, category: str) -> str:
        result = self.__cur.execute('''SELECT topic_url from topics WHERE category_name=? AND topic_name=?''',
                                    (category, topic)).fetchone()
        if result:
            result = result[0]
        return result

    def _get_section_url(self, section: str, chapter: str, topic: str, category: str) -> str:
        chapter_id = self._get_chapter_id1(chapter, topic, category)
        if not chapter_id:
            return None
        result = self.__cur.execute('''SELECT section_url from sections WHERE section_name=? AND chapter_id=?''',
                                    (section, chapter_id)).fetchone()
        if result:
            result = result[0]
        return result


class SessionDB:
    '''Used for storing user selections/settings. 
    Data changes are saved automatically.
    Does not use any database as storing list/datetime in rdbms is BAD IDEA.
    '''
    __dbpath = 'session.pickle'

    def __init__(self) -> None:
        if os.path.exists(SessionDB.__dbpath):
            with open(SessionDB.__dbpath, 'rb') as f:
                self.category, self.topic, self.chapter, \
                    self.sections, self.last_refreshed, \
                    self.shuffle_questions, self.auto_refresh = pickle.load(f)
        else:
            self.category = None
            self.topic = None
            self.chapter = None
            self.sections = None
            self.last_refreshed = datetime.utcnow()
            self.shuffle_questions = 'No'
            self.auto_refresh = 'Yes'

    def set_category(self, val: str):
        self.category = val
        self.topic = None
        self.chapter = None
        self.sections = None
        self.__commit()

    def set_topic(self, val: str):
        self.topic = val
        self.chapter = None
        self.sections = None
        self.__commit()

    def set_chapter(self, val: str):
        self.chapter = val
        self.sections = None
        self.__commit()

    def set_sections(self, vals: list[str]):
        self.sections = vals
        self.__commit()

    def toggle_auto_refresh(self):
        self.auto_refresh = 'Yes' if self.auto_refresh == 'No' else 'No'
        self.__commit()

    def toggle_shuffle_questions(self):
        self.shuffle_questions = 'Yes' if self.shuffle_questions == 'No' else 'No'
        self.__commit()

    def requires_refresh(self) -> bool:
        if self.auto_refresh == 'Yes':
            return (datetime.utcnow() - self.last_refreshed).days >= 7
        return False

    def refreshed(self):
        self.last_refreshed = datetime.utcnow()
        self.__commit()

    def __commit(self):
        with open(SessionDB.__dbpath, 'wb') as f:
            pickle.dump((self.category, self.topic, self.chapter,
                        self.sections, self.last_refreshed,
                        self.shuffle_questions, self.auto_refresh), f)
