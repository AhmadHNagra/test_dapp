import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { connect } from './redux/blockchain/blockchainActions'
import { fetchData } from './redux/data/dataActions'
import * as s from './styles/globalStyles'
import styled from 'styled-components'
import { create } from 'ipfs-http-client'
import Web3 from 'web3'
const { NFTUris } = require('./NFTUris.js')

export const StyledButton = styled.button`
  padding: 8px;
`
const ipfsClient = create('https://ipfs.infura.io:5001/api/v0')

function App() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [metadatCreation, setMetadataCreation] = useState(false)
  const [mintCount, setMintCount] = useState('1')

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
      setLoading(true)
      setStatus('Creating Metadata')
      toDataURL(image, useBuffer)
    } catch (err) {
      console.log('Something went wrong', err)
      setLoading(false)
      setStatus('Error')
    }
  }
  const useBuffer = async (imageUri) => {
    const addedImage = await ipfsClient.add(imageUri)
    const metaDataObj = {
      name: name,
      description: description,
      image: ipfsBaseUrl + addedImage.path,
      attributes: [
        {
          trait_type: 'Agility',
          value: 1 + Math.random() * (250 - 1),
        },
        {
          trait_type: 'Strength',
          value: 1 + Math.random() * (250 - 1),
        },
        {
          trait_type: 'Intelligence',
          value: 1 + Math.random() * (250 - 1),
        },
      ],
    }
    const addedMetadata = await ipfsClient.add(JSON.stringify(metaDataObj))
    const tokenUri = ipfsBaseUrl + addedMetadata.path
    console.log(tokenUri)
  }

  const Initiatemint = () => {
    for (var i = 0; i < parseInt(mintCount); i++) {
      mint()
    }
  }

  const mint = () => {
    try {
      setLoading(true)
      setStatus('Begun minting process')
      blockchain.smartContract.methods
        .GetAllExistingTokens()
        .call()
        .then((receipt) => {
          let existingUri = receipt.map((a) => a.uri)
          if (existingUri.length >= 30) {
            setLoading(false)
            setStatus('All possible Tokens minted')
            return
          }
          var uri = NFTUris[Math.floor(Math.random() * 30)]
          console.log('All minted tokens', existingUri, uri)
          while (existingUri.includes(uri)) {
            uri = NFTUris[Math.floor(Math.random() * 30)]
            console.log('refreshing uri pick')
          }
          blockchain.smartContract.methods
            .CreateCollectible(blockchain.account, uri)
            .send({
              from: blockchain.account,
              value: Web3.utils.toWei('0.07', 'ether'),
            })
            .once('error', (err) => {
              console.log('Error in minting', err)
              setLoading(false)
              setStatus('Transaction rejected')
            })
            .then((receipt) => {
              console.log('Minted successfully', receipt)
              setLoading(false)
              setStatus('Success')
            })
            .catch((err) => console.log(err))
        })
    } catch (error) {
      setLoading(false)
      setStatus(error)
    }
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
          {loading ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: 'center' }}>
                Loading....
              </s.TextDescription>
            </>
          ) : null}
          {status !== '' ? (
            <>
              <s.SpacerSmall />
              <s.TextDescription style={{ textAlign: 'center' }}>
                {status}
              </s.TextDescription>
            </>
          ) : null}
          <s.SpacerLarge />
          <StyledButton
            onClick={(e) => {
              e.preventDefault()
              Initiatemint()
            }}
          >
            MINT
          </StyledButton>
          <select
            value={mintCount}
            onChange={(e) => {
              setMintCount(e.target.value)
            }}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
          <s.SpacerLarge />
          <StyledButton
            onClick={(e) => {
              e.preventDefault()
              setMetadataCreation(!metadatCreation)
            }}
          >
            Enable/Disable Metadata Creation
          </StyledButton>
          <s.SpacerLarge />
          {metadatCreation !== false ? (
            <>
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
            </>
          ) : null}
        </s.Container>
      )}
    </s.Screen>
  )
}

export default App
