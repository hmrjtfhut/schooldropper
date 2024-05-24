document.addEventListener('DOMContentLoaded', () => {
    const storyForm = document.getElementById('story-form');
    const newsStoriesDiv = document.getElementById('news-stories');

    storyForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;

        const story = {
            title: title,
            content: content
        };

        addStory(story);
        storyForm.reset();
    });

    function addStory(story) {
        const storyDiv = document.createElement('div');
        storyDiv.classList.add('story');

        const storyTitle = document.createElement('h3');
        storyTitle.textContent = story.title;

        const storyContent = document.createElement('p');
        storyContent.textContent = story.content;

        storyDiv.appendChild(storyTitle);
        storyDiv.appendChild(storyContent);

        newsStoriesDiv.appendChild(storyDiv);
    }
});
