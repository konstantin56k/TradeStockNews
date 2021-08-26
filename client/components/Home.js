import React, { useEffect, useState } from 'react';
import {connect} from 'react-redux';
import axios from 'axios';

/**
 * COMPONENT
 */
export const Home = props => {

  var options = {
    method: 'GET',
    url: 'https://seeking-alpha.p.rapidapi.com/news/list',
    params: {id: 'aapl', until: '0', size: '3'},
    headers: {
      'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
      'x-rapidapi-key': 'af0e4ec1bfmsh44856a25984ea30p14d385jsn3f95739cb013'
    }
  };

  var optionsForNewsDetails = {
    method: 'GET',
    url: 'https://seeking-alpha.p.rapidapi.com/news/get-details',
    params: {id: '3734052'},
    headers: {
      'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
      'x-rapidapi-key': 'af0e4ec1bfmsh44856a25984ea30p14d385jsn3f95739cb013'
    }
  };

  const {username} = props;
  const initialState = {
    content: '',
    newsIds: []
  }
  const [state, setState] = useState(initialState);

  useEffect(() => {
    axios.request(options).then(function (response) {
      const arrWithNewsObj = response.data.data;
      const newsIds = arrWithNewsObj.map(newsObj => {
        return newsObj.id
      });
      setState(prevState => {
        return { ...prevState, newsIds: newsIds }
      })
    }).catch(function (error) {
      console.error(error);
      });

    axios.request(optionsForNewsDetails).then(function (response) {
        const contentStr = response.data.data.attributes.content
        setState(prevState => {
          return { ...prevState, content: contentStr }
        })
      }).catch(function (error) {
        console.error(error);
        });
  }, []);

  return (
    <div>
      <h3>Welcome, {username}</h3>
      <div>
        <div dangerouslySetInnerHTML={{__html: state.content}} />
      </div>
      
      <div>
        <ul>
          {state.newsIds.map((newsId, idx) => {
            return <li key={idx}>{newsId}</li>
            })
          }
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
