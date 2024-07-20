from flask import Flask, render_template, url_for, redirect
from flask import request
from mods import helper
from mods.database import SessionDB

app = Flask(__name__)
session = SessionDB('0')


@app.route('/')
@app.route('/home')
def home():
    return render_template('index.html', title='Homepage', sections=session.sections)


@app.route('/categories', methods=['GET', 'POST'])
def categories():
    if request.method == 'POST':
        category = request.form['items']
        if category:
            session.set_category(category)
            return redirect(url_for('topics'))
    categories = helper.get_categories()
    if not categories:
        return redirect(url_for('error'))
    return render_template('single_selection.html', title='Select Category', items=categories)


@app.route('/topics', methods=['GET', 'POST'])
def topics():
    if request.method == 'POST':
        topic = request.form['items']
        if topic:
            session.set_topic(topic)
            return redirect(url_for('chapters'))
    if not session.category:
        return redirect(url_for('categories'))
    category = session.category
    topics = helper.get_topics(category)
    if not (topics and category):
        return redirect(url_for('error'))
    return render_template('single_selection.html', title='Select Topic', items=topics, prev_url=url_for('categories'))


@app.route('/chapters', methods=['GET', 'POST'])
def chapters():
    if request.method == 'POST':
        chapter = request.form['items']
        if chapter:
            session.set_chapter(chapter)
            return redirect(url_for('sections'))
    if not session.category:
        return redirect(url_for('categories'))
    if not session.topic:
        return redirect(url_for('topics'))
    category = session.category
    topic = session.topic
    if not (category and topic):
        return redirect(url_for('error'))
    chapters = helper.get_chapters(topic, category)
    if not chapters:
        return redirect(url_for('error'))

    return render_template('single_selection.html', title='Select Chapter', items=chapters, prev_url=url_for('topics'))


@app.route('/sections', methods=['GET', 'POST'])
def sections():
    if request.method == 'POST':
        sections = request.form.getlist('sections')
        if sections:
            session.set_sections(sections)
            return redirect(url_for('home'))
    if not session.category:
        return redirect(url_for('categories'))
    if not session.topic:
        return redirect(url_for('topics'))
    if not session.chapter:
        return redirect(url_for('chapters'))
    category = session.category
    topic = session.topic
    chapter = session.chapter

    if not (category and topic and chapter):
        return redirect(url_for('error'))
    sections = helper.get_sections(chapter, topic, category)
    if not sections:
        return redirect(url_for('error'))

    return render_template('select_sections.html', title='Select Sections', sections=sections, prev_url=url_for('chapters'))


@app.route('/quiz')
def quiz():
    if not session.category:
        return redirect(url_for('categories'))
    if not session.topic:
        return redirect(url_for('topics'))
    if not session.chapter:
        return redirect(url_for('chapters'))
    if not session.sections:
        return redirect(url_for('sections'))
    questions_dict = {}
    missing_sections = []
    for section in session.sections:
        questions = helper.get_questions(
            section, session.chapter, session.topic, session.category)
        if not questions:
            missing_sections.append(section)
            continue
        questions_dict.update(helper.to_dict(section, questions))
    return render_template('quiz.html', title='Quiz', questions_json=questions_dict, missing_sections=missing_sections)


@app.route('/about')
def about():
    return render_template('about.html', title="About")


@app.route('/quiz_history')
def quiz_history():
    return render_template('quiz_history.html', title='History')


@app.route('/error')
def error():
    return render_template('error.html', title='error.html')


@app.route('/postmethod', methods=['POST'])
def postmethod():
    global session
    user_id = request.get_json()['user_id']
    session = SessionDB(user_id)
    return '', 200


@app.route('/getmethod', methods=['GET'])
def getmethod():
    data = {
        'category': session.category,
        'topic': session.topic,
        'chapter': session.chapter,
        'sections': session.sections,
    }
    return data


if __name__ == '__main__':
    app.run(debug=False)
