import React, { useEffect, useState } from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import { async } from 'regenerator-runtime';

/**
 * COMPONENT
 */
export const Home = props => {

  const {username} = props;

  const initialState = {
    content: [],
    newsIds: [],
    sentiment: [],
    stockName: 'googl',
    averageScore: 0
  }

  const [state, setState] = useState(initialState);

  async function getIdsAndDetails() {
    try {
      const newsList = await axios.get(`https://seeking-alpha.p.rapidapi.com/news/list?id=${state.stockName}&size=3`, {
        headers: {
          'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
          'x-rapidapi-key': 'af0e4ec1bfmsh44856a25984ea30p14d385jsn3f95739cb013'
        }
      });
    
      const arrWithNewsObj = newsList.data.data;
      const newsIds = arrWithNewsObj.map(newsObj => {
        return newsObj.id
      });

      setState(prevState => {
        return { ...prevState, newsIds: newsIds }
      });
      
      const newsDetailsPromises = newsIds.map(async newsId => {
        const newsDetails = await axios.get(`https://seeking-alpha.p.rapidapi.com/news/get-details?id=${newsId}`, {
          headers: {
            'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
            'x-rapidapi-key': 'af0e4ec1bfmsh44856a25984ea30p14d385jsn3f95739cb013'
          }
      })
        return newsDetails
      })

      const arrOfNewsContent = await Promise.all(newsDetailsPromises)
        .then((result) => {
          const _arrOfNewsContent = result.map(newsDetailObj => {
            return newsDetailObj.data.data.attributes.content
          })
          return _arrOfNewsContent
        })

      setState(prevState => {
        return { ...prevState, content: arrOfNewsContent }
      });

      function cleanHTML(text) {
        text = text.toString();
        return text.replace(/(<([^>]+)>)/ig, "");
      }

      const sentimentPromises = arrOfNewsContent.map(async content => {
        const sentimentResult = await axios.get('https://twinword-sentiment-analysis.p.rapidapi.com/analyze/', {
          params: {
            text: cleanHTML(content).slice(0, 1499)
          },
          headers: {
            'x-rapidapi-host': 'twinword-sentiment-analysis.p.rapidapi.com',
            'x-rapidapi-key': 'af0e4ec1bfmsh44856a25984ea30p14d385jsn3f95739cb013',
            'Access-Control-Allow-Origin': '*',
          },
          mode: 'cors',
        })
        return sentimentResult
      })

      const sentimentAnalyzes = await Promise.all(sentimentPromises)
        .then((result) => {
          const _sentimentAnalyzes = result.map(sentiment => {
            return sentiment.data.type
          })
          return _sentimentAnalyzes
        })

      setState(prevState => {
        return { ...prevState, sentiment: sentimentAnalyzes }
      });

      const sentimentScores = await Promise.all(sentimentPromises)
      .then((result) => {
        const _sentimentScores = result.map(score => {
          return score.data.score
        })
        return _sentimentScores
      })
      
      const scoresSum = sentimentScores.reduce((sum, oneScore) => {
       return oneScore * 1 + sum
      }, 0)

      const averageScore = scoresSum / sentimentScores.length

      setState(prevState => {
        return { ...prevState, averageScore: averageScore }
      });

    } catch (error) {
      console.log(error)
    }
  };

  function positOrNegat(score) {
    if (score <= -0.05) {
      return 'News are negative'
    } else if (score > -0.05 && score < 0) {
      return 'News are little negative'
    } else if (score === 0) {
      return 'News are neutral'
    } else if (score > 0 && score < 0.05) {
      return 'News are little positive'
    } else if (score > 0.05) {
      return 'News are positive'
    }
  }

  function handleChange(evt) {
    console.log(evt.target.value)
    setState({
      ...state,
      [evt.target.name]: evt.target.value
    });
    console.log(state.stockName)
  }

  function handleSubmit(evt) {
    evt.preventDefault()
    // setState({
    //   ...state,
    //   [evt.target.name]: evt.target.value
    // });
  }

  useEffect(() => {
    getIdsAndDetails()
  }, []);

  useEffect(() => {
    getIdsAndDetails()
  }, [state.stockName]);

  // console.log('outside state.content', state.content)
  // console.log('outside state.newsIds', state.newsIds)


  return (
    <div>
      <div>
        
        <form onSubmit={handleSubmit}>
          <div className='search-box'>
            <div><label htmlFor='stockName'>Enter stock name:</label></div>
            <div><input name='stockName' type="text" value={state.stockName} onChange={handleChange}/></div>
            <div><input className='submit-btn' type="submit" value="Make a decision" /></div>
          </div>
        </form>
        
        <div className='ave-score'>
          {[positOrNegat(state.averageScore), ' ', state.averageScore]}
        </div>
        <ul>
          {state.sentiment.map((sentiment, idx) => {
            return <li key={idx}>{sentiment}</li>
            })
          }
        </ul>
      </div>
      <div className='news-content'>
        {state.content.map((content, indx) => {
          return <div key={indx} dangerouslySetInnerHTML={{__html: content}} />
          })
        }
      </div>
      
      <div>
        <ul>
          {/* {state.newsIds.map((newsId, idx) => {
            return <li key={idx}>{newsId}</li>
            })
          } */}
        </ul>
      </div>
      
    </div>
  )
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    username: state.auth.username
  }
}

export default connect(mapState)(Home)
