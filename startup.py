from flask import Flask, render_template, request
import finnhub
import requests
import datetime
from dateutil.relativedelta import relativedelta
from flask import jsonify, session

display_div = 0

app = Flask(__name__)
app.secret_key = 'mysecretkey'

def convert_unix_to_date(unix_timestamp):
    date = datetime.datetime.utcfromtimestamp(unix_timestamp)
    formatted_date = date.strftime('%d %B, %Y')
    return formatted_date

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    
    try:
        search_term = request.form.get('searchTerm')
        print(search_term)
        session['search_term'] = search_term  # store search_term in session

        
        now = datetime.datetime.now()
        formatted_date = now.strftime("%Y-%m-%d")
        session['formatted_date'] = formatted_date  # store formatted_date in session
        print(formatted_date)

        six_months_later = now - relativedelta(months=+6)
        formatted_past_date = six_months_later.strftime("%Y-%m-%d")
        session['formatted_past_date'] = formatted_past_date
        print(six_months_later.strftime("%Y-%m-%d"))

        finnhub_client = finnhub.Client(api_key="cnb1881r01qks5iuscn0cnb1881r01qks5iuscng")        
        
        company_profile2 = finnhub_client.company_profile2(symbol=search_term)

        quote = finnhub_client.quote(search_term)
        recommendation_trends = finnhub_client.recommendation_trends(search_term)

        # poly = requests.get(f'https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-07-09?apiKey=QbUvKSfaomuQ26Fa3twUTwQUQQTQxZ1m').json()


        company_news = finnhub_client.company_news(search_term, _from=six_months_later.strftime("%Y-%m-%d"), to=formatted_date)

        for news_item in company_news:
            news_item['datetime'] = convert_unix_to_date(news_item['datetime'])

        company_news0 = company_news[0]
        company_news1 = company_news[1]
        company_news2 = company_news[2]
        company_news3 = company_news[3]
        company_news4 = company_news[4]

        #Add checks for all the data
        if len(company_profile2) == 0:
            display_div = 0
        else:
            display_div = 1
        
        recommendation_trends = recommendation_trends[0]

        sDp = 'Up'
        sD = 'Up'
        time = convert_unix_to_date(quote['t'])
        if quote['dp'] < 0:
            sDp = "Down"
        if quote['d'] < 0:
            sD = "Down"
        quote.update({'time': time, 'sDp': sDp, 'sD': sD})

        return render_template('index.html', display_div=display_div, search_term=search_term, company_profile2=company_profile2, quote=quote, recommendation_trends=recommendation_trends, company_news1=company_news1, company_news2=company_news2, company_news3=company_news3, company_news0=company_news0, company_news4=company_news4)
    
    except Exception as e:
        print("Error: ", e)
        display_div = 0
        return render_template('index.html', display_div=display_div)

@app.route('/get_variable')
def get_variable():
    search_term = session.get('search_term')  # get search_term from session
    formatted_date = session.get('formatted_date')
    formatted_past_date = session.get('formatted_past_date')
    print(search_term)
    print(formatted_date)
    print(formatted_past_date)
    poly = requests.get(f'https://api.polygon.io/v2/aggs/ticker/'+search_term+'/range/1/day/'+formatted_past_date+'/'+formatted_date+'?apiKey=QbUvKSfaomuQ26Fa3twUTwQUQQTQxZ1m').json()
    x = poly['results']
    poly_out = []
    for i in x:
        poly_out.append([i['t'], i['c']])

    poly_out2 = []
    for i in x:
        poly_out2.append([i['t'], i['v']])

    return jsonify(my_var=poly_out, search_term=search_term, formatted_date=formatted_date, formatted_past_date=formatted_past_date, my_var2=poly_out2)

if __name__ == '__main__':
    app.run(debug=True)