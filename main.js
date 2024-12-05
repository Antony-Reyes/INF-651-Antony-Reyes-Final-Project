// Function 1: createElemWithText
function createElemWithText(tagName = "p", textContent = "", className) {
    const element = document.createElement(tagName);
    element.textContent = textContent;
    if (className) element.className = className;
    return element;
}

// Function 2: createSelectOptions
function createSelectOptions(users) {
    if (!users) return;
    return users.map(user => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        return option;
    });
}

// Function 3: toggleCommentSection
function toggleCommentSection(postId) {
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    if (section) section.classList.toggle("hide");
    return section;
}

// Function 4: toggleCommentButton
function toggleCommentButton(postId) {
    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    if (button) {
        button.textContent = button.textContent === "Show Comments" ? "Hide Comments" : "Show Comments";
    }
    return button;
}

// Function 5: deleteChildElements
function deleteChildElements(parentElement) {
    if (!parentElement) return;
    while (parentElement.lastElementChild) {
        parentElement.removeChild(parentElement.lastElementChild);
    }
    return parentElement;
}

// Function 6: manageButtonListeners
function manageButtonListeners(action) {
    const buttons = document.querySelectorAll("main button");
    if (buttons) {
        buttons.forEach(button => {
            const postId = button.dataset.postId;
            if (postId) {
                button[`${action}EventListener`]("click", (event) => toggleComments(event, postId));
            }
        });
    }
    return buttons;
}

function addButtonListeners() {
    return manageButtonListeners("add");
}

function removeButtonListeners() {
    return manageButtonListeners("remove");
}

// Function 7: createComments
function createComments(comments) {
    if (!comments) return;
    const fragment = document.createDocumentFragment();
    comments.forEach(comment => {
        const article = document.createElement("article");
        const h3 = createElemWithText("h3", comment.name);
        const p1 = createElemWithText("p", comment.body);
        const p2 = createElemWithText("p", `From: ${comment.email}`);
        article.append(h3, p1, p2);
        fragment.appendChild(article);
    });
    return fragment;
}

// Function 8: populateSelectMenu
function populateSelectMenu(users) {
    if (!users) return;
    const selectMenu = document.getElementById("selectMenu");
    const options = createSelectOptions(users);
    options.forEach(option => selectMenu.appendChild(option));
    return selectMenu;
}

// Function 9: getUsers
async function getUsers() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

// Function 10: getUserPosts
async function getUserPosts(userId) {
    if (!userId) return;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

// Function 11: getUser with caching
const userCache = {};

async function getUser(userId) {
    if (!userId) return;
    if (userCache[userId]) return userCache[userId];
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        const user = await response.json();
        userCache[userId] = user;
        return user;
    } catch (error) {
        console.error(error);
    }
}

// Function 12: getPostComments
async function getPostComments(postId) {
    if (!postId) return;
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

// Function 13: displayComments
async function displayComments(postId) {
    if (!postId) return;
    const section = document.createElement("section");
    section.dataset.postId = postId;
    section.classList.add("comments", "hide");
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.appendChild(fragment);
    return section;
}

// Function 14: createPosts
async function createPosts(posts) {
    if (!posts) return;
    const fragment = document.createDocumentFragment();
    for (const post of posts) {
        const article = document.createElement("article");
        const h2 = createElemWithText("h2", post.title);
        const p1 = createElemWithText("p", post.body);
        const p2 = createElemWithText("p", `Post ID: ${post.id}`);
        const author = await getUser(post.userId);
        const p3 = createElemWithText("p", `Author: ${author.name} with ${author.company.name}`);
        const p4 = createElemWithText("p", author.company.catchPhrase);
        const button = createElemWithText("button", "Show Comments");
        button.dataset.postId = post.id;
        const section = await displayComments(post.id);
        article.append(h2, p1, p2, p3, p4, button, section);
        fragment.appendChild(article);
    }
    return fragment;
}

// Function 15: displayPosts
async function displayPosts(posts) {
    const main = document.querySelector("main");
    const element = posts
        ? await createPosts(posts)
        : createElemWithText("p", "Select an option to display posts.", "default-text");
    main.appendChild(element);
    return element;
}

// Function 16: toggleComments
function toggleComments(event, postId) {
    if (!event || !postId) return;
    event.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
}

// Function 17: refreshPosts
async function refreshPosts(posts) {
    if (!posts) return;
    const buttons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector("main"));
    const element = await displayPosts(posts);
    addButtonListeners();
    return [buttons, main, element];
}

// Function 18: selectMenuChangeEventHandler
async function selectMenuChangeEventHandler(event) {
    if (!event) return;
    const userId = event.target.value || 1;
    const posts = await getUserPosts(userId);
    const refreshPostsResult = await refreshPosts(posts);
    return [userId, posts, refreshPostsResult];
}

// Function 19: initPage
async function initPage() {
    const users = await getUsers();
    const selectMenu = populateSelectMenu(users);
    return [users, selectMenu];
}

// Function 20: initApp
function initApp() {
    initPage();
    const selectMenu = document.getElementById("selectMenu");
    selectMenu.addEventListener("change", selectMenuChangeEventHandler);
}

// Initialize the app
document.addEventListener("DOMContentLoaded", initApp);

