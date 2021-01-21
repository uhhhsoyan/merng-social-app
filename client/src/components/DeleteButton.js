import React, { useState } from 'react';
import { Icon, Confirm, Button } from 'semantic-ui-react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { FETCH_POSTS_QUERY } from '../util/graphql';

function DeleteButton({ postId, commentId, callback }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Dynamic mutation
  const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;

  const [deletePostOrMutation] = useMutation(mutation, {
    update(proxy) {
      setConfirmOpen(false);
      if (!commentId){
        // Remove post from cache
        const data = proxy.readQuery({
          query: FETCH_POSTS_QUERY
        });
        const filteredPosts = data.getPosts.filter(p => p.id !== postId);
        proxy.writeQuery({ 
          query: FETCH_POSTS_QUERY, 
          data: {
            getPosts: filteredPosts
          }
        })
        if (callback) callback();
      } 
    },
    variables: {
      postId,
      commentId
    }
  })
  return (
    <>
      <Button as='div' color='red' floated='right' onClick={() => setConfirmOpen(true)}>
        <Icon name='trash' style={{ margin: 0 }}/>
      </Button>
      <Confirm open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={deletePostOrMutation} />
    </>
  )
}

const DELETE_POST_MUTATION = gql`
  mutation deletePost($postId: ID!){
    deletePost(postId: $postId)
  }
`

const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id
      comments {
        id username createdAt body
      }
      commentCount
    }
  }
`

export default DeleteButton;



