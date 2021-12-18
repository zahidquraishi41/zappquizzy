from bs4 import BeautifulSoup
import requests


def scrap_categories() -> dict:
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

    def extract_col(col) -> dict:
        '''Retuns a dict object where each value is also a dict object.
        {$category_name: {$topic_name: $url}, ...}'''
        h3s = []
        uls = []
        for elem in col:
            if elem.name == 'h3':
                cat = elem.text.replace(' MCQs', '')
                h3s.append(cat)
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


def scrap_chapters(url: str) -> list[tuple[str, str, list[tuple[str, str]]]]:
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


def scrap_section(url: str) -> list[tuple[str, str, str, str]]:
    '''Scraps a section of chapter and returns an iterable object. 
    Each elem object is a tuple containing three strings which are (question, options, answer, explanation).
    eg, https://www.sanfoundry.com/operating-system-questions-answers-basics/'''
    try:
        request = requests.get(url)
        if not request.ok:
            raise Exception()
        bs = BeautifulSoup(request.text, 'lxml')
    except:
        return None
    main_content = bs.find('div', class_='entry-content')
    if not main_content:
        return None
    __clean_section(main_content)
    __math_patch(main_content)

    mcqs = []
    main_list = list(main_content.find_all(recursive=False))
    answers_div = main_content.find_all(
        'div', class_='collapseomatic_content', recursive=False)
    for answer_div in answers_div:
        i = main_list.index(answer_div) - 1
        data = []
        while i > 0:
            elem = main_list[i]
            if elem.name == 'div' and elem.has_attr('class') and 'hk1_style-wrap5' in elem['class']:
                code = []
                for pre in elem.find_all('pre'):
                    code.append(pre.text.strip())
                data.insert(0, '\n'.join(code))
            else:
                if elem.text.strip():
                    data.insert(0, elem.text.strip())
            if __is_question(elem):
                data[0] = (data[0].split('.', 1)[1]).strip()
                break
            i -= 1

        filtered_data = ['']
        for e1 in data:
            if '\n' in e1:
                for e2 in e1.split('\n'):
                    if e2.startswith(('a)', 'b)', 'c)', 'd)')):
                        filtered_data.append(e2)
                    else:
                        filtered_data.append(filtered_data.pop() + '\n' + e2)
            else:
                if e1.startswith(('a)', 'b)', 'c)', 'd)')):
                    filtered_data.append(e1)
                else:
                    filtered_data.append(filtered_data.pop() + '\n' + e1)
        question = filtered_data[0].strip('\n')
        options = filtered_data[1:]
        options = '\n'.join(options)
        answer = answer_div.text.split(
            '\n', 1)[0].replace('Answer:', '').strip()
        explanation = answer_div.text.split('\n', 1)[1]
        explanation = explanation.replace(
            '\nadvertisement\n', '').strip('\n').strip()

        mcqs.append((question, options,
                    answer, explanation))

    return mcqs
