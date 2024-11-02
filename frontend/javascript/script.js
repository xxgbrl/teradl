// Global
const api = 'http://127.0.0.1:5000'; // Change This
// const api = 'https://teradl-api.dapuntaratya.com'; // Change This
let buffer = '';
let list_file;
let params;

// Add Event Listener Input
const inputForm = document.getElementById('terabox_url');
inputForm.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const url = inputForm.value;
        readInput(url);
    }
});

// Add Event Listener Submit Button
const submitButton = document.getElementById('submit_button');
submitButton.addEventListener('click', (event) => {
    const url = inputForm.value;
    readInput(url);
});

// Loading Spinner 1
function loading(element_id, active) {
    const loadingBox = document.getElementById(element_id);
    if (active)  {
        loadingBox.innerHTML = `<div id="loading-spinner" class="spinner-container"><div class="spinner"></div></div>`;
        loadingBox.style.pointerEvents = 'none';
    }
    else {
        loadingBox.innerHTML = `<i class="fa-solid fa-arrow-right"></i>`;
        loadingBox.style.pointerEvents = 'auto';
    }
}

// Loading Spinner 2
function loading2(element_id, active) {
    const loadingBox = document.getElementById(element_id);
    if (active)  {
        loadingBox.innerHTML = `<div id="loading-spinner" class="spinner-container"><div class="spinner2"></div></div>`;
        loadingBox.style.pointerEvents = 'none';
    }
    else {
        loadingBox.innerHTML = `Failed`;
        loadingBox.style.pointerEvents = 'auto';
    }
}

// Time Sleep
function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s*1000));
}

// Read Input
async function readInput(raw_url) {

    const url = raw_url.replace(/\s/g, '') === '' ? null : raw_url;

    if (url) {
        list_file = [];
        params = {};
        document.getElementById('result').innerHTML = '';
        loading('submit_button', true);
        await fetchURL(url);
        loading('submit_button', false);
        inputForm.value = '';
    }

    else {
        loading('submit_button', false);
        inputForm.value = '';
    }
}

// Fetch URL
async function fetchURL(url) {

    const get_file_url = `${api}/generate_file`;
    const headers = {'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*'};
    const data = {
        'method'  : 'POST',
        'mode'    : 'cors',
        'headers' : headers,
        'body'    : JSON.stringify({'url':url})
    };

    const req = await fetch(get_file_url, data);
    const response = await req.json();

    if (response.status == 'success') {
        params = {uk:response.uk, shareid:response.shareid, timestamp:response.timestamp, sign:response.sign, js_token:response.js_token, cookie:response.cookie};
        await sortFile(response.list);
    }

    else {
        loading('submit_button', false);
        inputForm.value = '';
        errorFetch();
    }
}

// Error Fetch
function errorFetch() {
    const box_result = document.getElementById('result');
    box_result.innerHTML = `
        <div class="container-failed">
            <span>Fetch Failed</span>
        </div>`;
}

// Sort File Recursively
async function sortFile(list_file) {
    list_file.forEach((item) => {
        if (item.is_dir == 1) {sortFile(item.list);}
        else {printItem(item);}
    });
}

// Show Item
async function printItem(item) {
    const box_result = document.getElementById('result');
    const new_element = document.createElement('div');
    new_element.className = 'container-item';
    new_element.innerHTML = `
        <div id="image-${item.fs_id}" class="container-image"><img src="${item.image}" onclick="zoom(this)" crossOrigin="anonymous"></div>
        <div class="container-info">
            <span id="title-${item.fs_id}" class="title">${item.name}</span>
            <div class="container-button">
                <div id="container-download-${item.fs_id}" class="container-download-button">
                    <button id="get-download-${item.fs_id}" type="button" class="download-button">Download ${convertToMB(item.size)} MB</button>
                </div>
                <div class="container-stream-button">
                    <button id="stream-${item.fs_id}" type="button" class="stream-button"><i class="fa-solid fa-play"></i></button>
                </div>
            </div>
        </div>`;
    box_result.appendChild(new_element);

    const downloadButton = new_element.querySelector(`#get-download-${item.fs_id}`);
    downloadButton.addEventListener('click', () => initDownload(item.fs_id));

    const streamButton = new_element.querySelector(`#stream-${item.fs_id}`);
    streamButton.addEventListener('click', () => initStream(item.fs_id));
}

// Convert Bytes To MegaBytes
function convertToMB(bytes) {
    const MB = bytes / (1024 * 1024);
    return MB.toFixed(0);
}

// Initialization for download
async function initDownload(fs_id) {

    loading2(`get-download-${fs_id}`, true);

    const param = {...params, 'fs_id':fs_id};
    const get_file_url = `${api}/generate_link`;
    const headers = {'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*'};
    const data = {
        'method'  : 'POST',
        'mode'    : 'cors',
        'headers' : headers,
        'body'    : JSON.stringify(param)
    };

    const req = await fetch(get_file_url, data);
    const response = await req.json();

    if (response.status == 'success') {
        const box_button = document.getElementById(`container-download-${fs_id}`);
        box_button.innerHTML = '';
        const downloadLinks = response.download_link;
        Object.entries(downloadLinks).forEach(([key, value], index) => {

            const new_element = document.createElement('button');
            new_element.id = `download-${index+1}-${fs_id}`;
            new_element.innerText = index+1;
            new_element.className = 'download-button';
            new_element.setAttribute('value',value);
            box_button.appendChild(new_element);

            new_element.addEventListener('click', () => startDownload(new_element.value));
        });
    }

    else {
        loading2(`get-download-${fs_id}`, false);
    }
}

// Start Download
async function startDownload(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Initialization for stream
async function initStream(fs_id) {
    // console.log('Stream', fs_id);
    alert('Maaf, Fitur Streaming Belum Tersedia');
}