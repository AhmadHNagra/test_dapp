import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { connect } from './redux/blockchain/blockchainActions'
import { fetchData } from './redux/data/dataActions'
import * as s from './styles/globalStyles'
import styled from 'styled-components'
import { create } from 'ipfs-http-client'
import Web3 from 'web3'

export const StyledButton = styled.button`
  padding: 8px;
`
const ipfsClient = create('https://ipfs.infura.io:5001/api/v0')

function App() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

  const dispatch = useDispatch()
  const blockchain = useSelector((state) => state.blockchain)
  const data = useSelector((state) => state.data)
  const ipfsBaseUrl = 'https://ipfs.infura.io/ipfs/'

  useEffect(() => {
    if (blockchain.account !== '' && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account))
    }
  }, [blockchain.smartContract, dispatch])

  const createMetadata = () => {
    try {
      toDataURL(image, useBuffer)
    } catch (err) {
      console.log('Something went wrong', err)
    }
  }
  const useBuffer = async (imageUri) => {
    const addedImage = await ipfsClient.add(imageUri)
    const metaDataObj = {
      name: name,
      description: description,
      image: ipfsBaseUrl + addedImage.path,
    }
    const addedMetadata = await ipfsClient.add(JSON.stringify(metaDataObj))
    const tokenUri = ipfsBaseUrl + addedMetadata.path
    console.log(tokenUri)
    mint(tokenUri)
  }

  const mint = (uri) => {
    console.log('chain object', blockchain)
    blockchain.smartContract.methods
      .CreateCollectible(blockchain.account, uri)
      .send({
        from: blockchain.account,
        value: Web3.utils.toWei('0.07', 'ether'),
      })
      .once('error', (err) => {
        console.log('Error in minting', err)
      })
      .then((receipt) => {
        console.log('Minted successfully', receipt)
      })
  }

  async function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.open('get', url)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      var fr = new FileReader()

      fr.onload = function () {
        console.log('result', this.result)
        const buffer = Buffer(this.result.split(',')[1], 'base64')
        callback(buffer)
      }

      fr.readAsDataURL(xhr.response) // async call
    }

    xhr.send()
  }

  /*const createImageBuffer = (image) => {
    let dataUrl = image.toDataURL('image/png')
    const buffer = Buffer(dataUrl.split(',')[1], 'base64')
    return buffer
  }*/

  const initiateMint = () => {}

  return (
    <s.Screen>
      {blockchain.account === '' || blockchain.smartContract === null ? (
        <s.Container flex={1} ai={'center'} jc={'center'}>
          <s.TextTitle>Connect to the Blockchain</s.TextTitle>
          <s.SpacerSmall />
          <StyledButton
            onClick={(e) => {
              e.preventDefault()
              dispatch(connect())
            }}
          >
            CONNECT
          </StyledButton>
          <s.SpacerSmall />
          {blockchain.errorMsg !== '' ? (
            <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
          ) : null}
        </s.Container>
      ) : (
        <s.Container flex={1} ai={'center'} style={{ padding: 24 }}>
          <s.TextTitle style={{ textAlign: 'center' }}>
            Welcome to Altar
          </s.TextTitle>
          <s.SpacerLarge />
          <StyledButton
            onClick={(e) => {
              e.preventDefault()
              initiateMint()
            }}
          >
            MINT
          </StyledButton>
          <s.SpacerLarge />
          <form
            onSubmit={(event) => {
              event.preventDefault()
              createMetadata()
            }}
          >
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                }}
                name="name"
              />
            </label>
            <label>
              Description:
              <input
                type="text"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                }}
                name="description"
              />
            </label>
            <img src={image} />
            <h1>Select Image</h1>
            <input
              type="file"
              name="myImage"
              onChange={(event) => {
                if (event.target.files && event.target.files[0]) {
                  let img = event.target.files[0]
                  setImage(URL.createObjectURL(img))
                }
              }}
            />
            <input type="submit" value="Create Metadata" />
          </form>
        </s.Container>
      )}
    </s.Screen>
  )
}

export default App
