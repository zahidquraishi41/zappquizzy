from bs4 import BeautifulSoup
import requests
from typing import List, Tuple, Dict
import logging


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
file_handler = logging.FileHandler('scrapper.log')
formatter = logging.Formatter('%(levelname)s:%(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


def scrap_categories() -> Dict:
    '''Scraps categories and topics within the category from homepage of sanfoundry.
    Returns {$category_name: {$topic_name: $url}, ...}'''
    url = 'https://www.sanfoundry.com/'
    try:
        request = requests.get(url)
        if not request.ok:
            raise Exception()
        bs = BeautifulSoup(request.text, 'lxml')
    except:
        return None

    def extract_col(col) -> Dict:
        '''Retuns a dict object where each value is also a dict object.
        {$category_name: {$topic_name: $url}, ...}'''
        h3s = []
        uls = []
        blocked = False
        for elem in col:
            if elem.name == 'h3':
                # patch: this category does have topic, chapter& sections but no questions.
                if elem.text == 'Engineering Branch Wise MCQs':
                    blocked = True
                    continue
                blocked = False
                cat = elem.text.replace(' MCQs', '')
                h3s.append(cat)
            if blocked:
                continue
            if elem.name == 'ul':
                ul = {}
                for li in elem.find_all('a'):
                    if 'MCQs' in li.text:
                        title = li.text\
                            .replace('1000 ', '')\
                            .replace(' MCQs', '')
                        ul[title] = li['href']
                if not ul:
                    h3s.pop(-1)
                else:
                    uls.append(ul)
        if len(h3s) != len(uls):
            return None

        # NOTE do not replace below function with dict(zip(h3s, uls))
        # it's skipping ul with no data. happens when new category is introduced on website and no data is added in it.
        col_data = {}
        for i in range(len(h3s)):
            if uls[i]:
                col_data[h3s[i]] = uls[i]
        return col_data

    all_data = {}
    try:
        col1 = bs.find(
            'div', class_='grid-33 tablet-grid-33 mobile-grid-100 first-column')
        col2 = bs.find(
            'div', class_='grid-33 tablet-grid-33 mobile-grid-100 second-column')
        col3 = bs.find(
            'div', class_='grid-33 tablet-grid-33 mobile-grid-100 third-column')
        for col in (col1, col2, col3):
            topics = extract_col(col)
            if topics:
                all_data.update(topics)
    except:
        return None

    return all_data


def scrap_chapters(url: str) -> List[Tuple[str, str, List[Tuple[str, str]]]]:
    '''Scraps the info about a chapter like different section names, descriptions and link for each section.
    Returns a list, each iterable object is a tuple containing 2 string and a list of tuple which are (chapter_name, chapter_description, [(section_name, section_url), ...]).
    eg, https://www.sanfoundry.com/operating-system-questions-answers/'''
    try:
        request = requests.get(url)
        if not request.ok:
            raise Exception()
        bs = BeautifulSoup(request.text, 'lxml')
    except:
        return None
    chapter_names = []
    chapter_desc = []
    chapter_sections = []
    try:
        for elem in bs.find_all('div', class_='sf-section'):
            if not all((elem.h2, elem.p, elem.table)):
                continue
            try:
                chapter_name = elem.h2.text.split('. ', maxsplit=1)[1]\
                    .replace('MCQs on', '')\
                    .replace('Multiple Choice Questions on', '')\
                    .replace('  ', ' ')\
                    .strip()
                chapter_names.append(chapter_name)
                chapter_desc.append(elem.p.text)
                sections = []
                for a in elem.find_all('a'):
                    sections.append((a.text.strip(), a['href']))
                chapter_sections.append(sections)
            except Exception:
                pass
    except:
        return None
    if not (len(chapter_names) == len(chapter_desc) == len(chapter_sections)):
        return None
    if len(chapter_names) == 0:
        return None

    return list(zip(chapter_names, chapter_desc, chapter_sections))


def __clean_section(content: BeautifulSoup) -> None:
    '''Perform cleanup inplace.'''
    ids = ['sf-video-ads']
    classes = [
        'mobile-content',
        'desktop-content',
        'sf-nav-bottom',
        'sf-desktop-ads',
        'sf-mobile-ads',
        'sf-video-yt',
        'sf-post-footer',
        'collapseomatic',
    ]

    def text(x): return x and x.startswith((
        'Sanfoundry Global Education',
        'To practice',
        'Participate in',
        'to get free Certificate',
        'advertisment',
    ))

    for tag in content.find_all():
        # Remove tags with specified classes
        if tag.attrs and any(cls in classes for cls in tag.attrs.get('class', [])):
            tag.decompose()
            continue

        # Remove tags with specified id
        if tag.id and tag.id in ids:
            tag.decompose()
            continue

        # Cleaning unwanted text
        if tag.text and text(tag.get_text(strip=True)):
            tag.decompose()
            continue


def __is_question(tag) -> bool:
    if tag.name == 'p':
        id = tag.text.split('.')[0]
        return id.isnumeric()
    return False


def __math_patch(content: BeautifulSoup):
    # replacing <sup>something</sup> with <sup>something^</sup>
    for supTag in content.find_all('sup'):
        supTag.find(text=supTag.text).replaceWith('^' + supTag.text)


def scrap_section(url: str, enable_logging: bool = False) -> List[Tuple[str, str, str, str]]:
    '''Scraps a section of chapter and returns an iterable object. 
    Each elem object is a tuple containing three strings which are (question, options, answer, explanation).
    eg, https://www.sanfoundry.com/operating-system-questions-answers-basics/'''
    logger.disabled = not enable_logging
    logger.info(f'Processing: {url}')
    try:
        request = requests.get(url)
        if not request.ok:
            raise Exception()
        bs = BeautifulSoup(request.text, 'lxml')
        main_content = bs.find('div', class_='entry-content')
        __clean_section(main_content)
        __math_patch(main_content)
        if not main_content:
            raise Exception('No content left after cleaning.')
    except:
        logger.exception('While processing html content.')
        return

    main_list = list(main_content.find_all(recursive=False))
    answers_div = main_content.find_all(
        'div', class_='collapseomatic_content', recursive=False)

    mcqs = []
    for answer_div in answers_div:
        i = main_list.index(answer_div) - 1
        data = []
        while i > 0:
            elem = main_list[i]
            if elem.name == 'div' and elem.has_attr('class') and 'hk1_style-wrap5' in elem['class']:
                code = []
                for pre in elem.find_all('pre'):
                    code.insert(0, pre.text)
                data.extend(code)
            else:
                data.extend(elem.text.split('\n'))
            if __is_question(elem):
                break
            i -= 1
        data = [elem.strip() for elem in data]

        questions = []
        options = []
        for elem in data:
            if elem.startswith(('a)', 'b)', 'c)', 'd)')):
                options.append(elem)
            else:
                questions.insert(0, elem)

        try:
            answer = answer_div.text.split('\n', 1)[0].strip()
            if answer and ':' in answer:
                answer = answer.split(':', 1)[1].strip()
            explanation = answer_div.text.split('\n', 1)[1]
            explanation = explanation.strip('\n').strip()
        except:
            logger.exception('Failed processing answer or explanation.')
            continue

        if not questions:
            logger.debug(f'Failed scrapping question from {answer_div}.')
            continue
        if len(options) <= 1:
            logger.debug(f'Failed scrapping options from {answer_div}.')
            continue
        if len(answer) != 1:
            logger.debug(f'Failed scrapping answer from {answer_div}.')
            continue
        mcqs.append(('\n'.join(questions), '\n'.join(options),
                    answer, explanation))
    logger.info(f'Successfully scrapped {len(mcqs)}/{len(answers_div)}')
    return mcqs
