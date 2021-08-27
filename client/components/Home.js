import React, { useEffect, useState } from 'react';
import {connect} from 'react-redux';
import axios from 'axios';

/**
 * COMPONENT
 */
export const Home = props => {

  const {username} = props;

  const initialState = {
    content: [],
    newsIds: []
  }

  const [state, setState] = useState(initialState);

  const changeOptionForNewsDetails = (newId) => {
    return {
      method: 'GET',
      url: 'https://seeking-alpha.p.rapidapi.com/news/get-details',
      params: {id: newId},
      headers: {
        'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
        'x-rapidapi-key': 'af0e4ec1bfmsh44856a25984ea30p14d385jsn3f95739cb013'
      }
    }
  }

  var options = {
    method: 'GET',
    url: 'https://seeking-alpha.p.rapidapi.com/news/list',
    params: {id: 'aapl', until: '0', size: '3'},
    headers: {
      'x-rapidapi-host': 'seeking-alpha.p.rapidapi.com',
      'x-rapidapi-key': 'af0e4ec1bfmsh44856a25984ea30p14d385jsn3f95739cb013'
    }
  };

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
  }, []);

  useEffect(() => {
    const contentArr = state.newsIds.map(newsId => {
      return axios.request(changeOptionForNewsDetails(newsId)).then(function (response) {
        return response.data.data.attributes.content
      }).catch(function (error) {
        console.error(error);
      });
    })
    setState(prevState => {
      return { ...prevState, content: contentArr }    
    })
  }, [state.newsIds]);
  console.log(state.content)

  return (
    <div>
      <h3>Welcome, {username}</h3>
      <div>
        {/* <div dangerouslySetInnerHTML={{__html: state.content}} /> */}
        
      </div>
      
      <div>
        <div>
          {/* {state.newsIds} */}
        </div>
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
