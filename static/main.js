document.getElementById('clearButton').addEventListener('click', clearFunction);


function clearFunction() {
    // Clear the search input
    document.getElementById('searchInput').value = '';

    // Hide the main-container
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        mainContainer.style.display = 'none';
    }

    const errorMessage = document.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}


function search(event) {
    event.preventDefault();  // Prevent default form submission
    var form = document.getElementById('searchForm');
    var formData = new FormData(form);

    // Make AJAX request to Flask server
    fetch('/search', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Update the content of the result div
        document.getElementById('result').innerText = data.result;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.navbar a');
    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove 'active' class from all tabs
            tabs.forEach(t => t.classList.remove('active'));

            // Add 'active' class to clicked tab
            this.classList.add('active');

            const contentId = this.getAttribute('href').substring(1);

            // Hide all content
            document.querySelectorAll('.content').forEach(c => {
                c.style.display = 'none';
            });

            // Show clicked content
            document.getElementById(contentId).style.display = 'block';
        });
    });
});



fetch('/get_variable')
    .then(response => response.json())
    .then(data => {
        let myVar = data.my_var;
        let search_term = data.search_term;
        let myVar2 = data.my_var2;
        createStockChart(myVar, myVar2, search_term);
    });

    async function createStockChart(myVar, myVar2, search_term) {
        const priceData = myVar;
        const volumeData = myVar2;
    
        console.log(priceData);
        console.log(volumeData);
    
        // Create the chart
        Highcharts.stockChart('container', {
            rangeSelector: {
                buttons: [{
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }, {
                    type: 'ytd',
                    text: 'YTD'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                selected: 1,
                inputEnabled: false
            },
            title: {
                text: `${search_term} Stock Price and Volume<br><a href="https://www.polygon.io" target="_blank" style="text-decoration: underline; font-size:smaller; font-weight:lighter; color: blue; text-decoration: underline;">Source: Polygon.io</a>`            },
            yAxis: [{
                title: {
                    text: 'Stock Price'
                },
                opposite: false,  // Stock price axis on the right
            }, {
                title: {
                    text: 'Volume'
                },
                top: '0%',   // Start from the top of the chart
                height: '100%', // Span the full height of the chart
                opposite: true,  // Volume axis on the left
            }],
            
            navigator: {
                series: {
                    accessibility: {
                        exposeAsGroupOnly: true
                    }
                }
            },
            series: [{
                name: search_term + ' Stock Price',
                data: priceData,
                type: 'area',
                threshold: null,

                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                yAxis: 0
            }, {
                name: search_term + ' Volume',
                data: volumeData,
                type: 'column',
                // threshold: null,
                pointPadding: 0.1,   // Adjust as needed, smaller values make thicker bars
                groupPadding: 0.001,   // Adjust as needed, smaller values reduce space between groups
                pointRange: 1,       
                color: 'black',  // Set the color of the bars to black
                yAxis: 1,
                tooltip: {
                    valueDecimals: 0
                }
            }]
        });
    }
    