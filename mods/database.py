import sqlite3 as sql
from typing import List, Tuple, Dict


class ScrapperDB:
    '''Used for storing data returned by scrapper module.
    Use this class with context manager. eg,
        with ScrapperDB() as db:
            cats = db.get_categories()'''
    __dbpath = 'cache.db'

    def __enter__(self):
        self._con = sql.Connection(self.__dbpath)
        self._cur = self._con.cursor()
        return self

    def __exit__(self, exc_type, exc_val, traceback):
        self._con.close()

    def get_categories(self) -> List[str]:
        result = self._cur.execute(
            '''SELECT category_name from categories'''
        ).fetchall()
        categories = [e[0] for e in result]
        return categories

    def get_topics(self, category: str) -> List[str]:
        result = self._cur.execute(
            '''SELECT topic_name from topics WHERE category_name=?''',
            (category, )).fetchall()
        return [e[0] for e in result]

    def get_chapters(self, topic: str, category: str) -> List[str]:
        topic_url = self._get_topic_url(topic, category)
        if not topic_url:
            return []
        result = self._cur.execute('''SELECT chapter_name from chapters WHERE topic_url=? ORDER BY chapter_id''',
                                   (topic_url, )).fetchall()
        return [e[0] for e in result]

    def get_sections(self, chapter: str, topic: str, category: str) -> List[str]:
        chapter_id = self._get_chapter_id(chapter, topic, category)
        if not chapter_id:
            return []
        result = self._cur.execute(
            '''SELECT section_name from sections WHERE chapter_id=? ORDER BY row_id''',
            (chapter_id, )
        ).fetchall()
        return [e[0] for e in result]

    def get_questions(self, section: str, chapter: str, topic: str, category: str) -> List[Tuple[str, str, str, str]]:
        section_url = self._get_section_url(section, chapter, topic, category)
        if not section_url:
            return []
        result = self._cur.execute(
            '''SELECT question, options, answer, explanation from questions WHERE section_url=? ORDER BY row_id''',
            (section_url, )
        ).fetchall()
        return result

    # TODO: combine id1 & id2 im sure one is removeable
    def _get_chapter_id(self, chapter: str, topic: str, category: str) -> int:
        topic_url = self._get_topic_url(topic, category)
        result = self._cur.execute(
            '''SELECT chapter_id from chapters WHERE chapter_name=? AND topic_url=?''',
            (chapter, topic_url)
        ).fetchone()
        if result:
            result = result[0]
        return result

    def _get_topic_url(self, topic: str, category: str) -> str:
        result = self._cur.execute(
            '''SELECT topic_url from topics WHERE category_name=? AND topic_name=?''',
            (category, topic)
        ).fetchone()
        if result:
            result = result[0]
        return result

    def _get_section_url(self, section: str, chapter: str, topic: str, category: str) -> str:
        chapter_id = self._get_chapter_id(chapter, topic, category)
        if not chapter_id:
            return None
        result = self._cur.execute(
            '''SELECT section_url from sections WHERE section_name=? AND chapter_id=?''',
            (section, chapter_id)
        ).fetchone()
        if result:
            result = result[0]
        return result


class SessionDB:
    '''Used for storing user selections/settings. 
    Data changes are saved automatically.'''
    __dbpath = 'session.db'
    __section_sep = chr(256)

    def __init__(self, user_id: str) -> None:
        self.__create_table()
        with sql.Connection(SessionDB.__dbpath) as con:
            cur = con.cursor()
            user_data = cur.execute('SELECT * FROM session WHERE user_id = ?',
                                    (user_id, )).fetchone()
        if user_data:
            _, self.category, self.topic, self.chapter, \
                self.sections = user_data
            if self.sections:
                if self.__section_sep in self.sections:
                    self.sections = self.sections.split(self.__section_sep)
                else:
                    self.sections = [self.sections]
        else:
            self.category = None
            self.topic = None
            self.chapter = None
            self.sections = None
        self.user_id = user_id

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

    def set_sections(self, vals: List[str]):
        self.sections = vals
        self.__commit()

    def __create_table(self):
        statement = '''CREATE TABLE IF NOT EXISTS session (
            user_id TEXT PRIMARY KEY,
            category TEXT,
            topic TEXT,
            chapter TEXT,
            sections TEXT
        )'''
        with sql.Connection(self.__dbpath) as con:
            cur = con.cursor()
            cur.execute(statement)
            con.commit()

    def __commit(self):
        if self.sections:
            sections_str = self.__section_sep.join(self.sections)
        else:
            sections_str = self.sections

        with sql.Connection(SessionDB.__dbpath) as con:
            cur = con.cursor()
            cur.execute(
                'INSERT OR REPLACE INTO session VALUES (?, ?, ?, ?, ?)',
                (self.user_id, self.category, self.topic, self.chapter,
                 sections_str)
            )
