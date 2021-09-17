const { assert } = require('chai')

const SmartContract = artifacts.require('./SmartContract.sol')

require('chai').use(require('chai-as-promised')).should()

contract('SmartContract', (accounts) => {
  let smartContract

  before(async () => {
    smartContract = await SmartContract.deployed()
  })

  describe('SmartContract Deployment', async () => {
    it('deploys successfully', async () => {
      const address = await smartContract.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
    })

    it('has correct name', async () => {
      const name = await smartContract.name()
      assert.equal(name, 'Test NFT')
    })
  })

  describe('NFT Creation', async () => {
    it('minted successfully', async () => {
      const uri = 'https://example.com'
      await smartContract.CreateCollectible(accounts[0], uri, {
        value: web3.utils.toWei('0.07', 'ether'),
      })

      const tokenUri = await smartContract.tokenURI(1)
      const balanceOfOwner = await smartContract.balanceOf(accounts[0])
      assert.equal(tokenUri, uri)
      assert.equal(balanceOfOwner, 1)
    })
  })
})
