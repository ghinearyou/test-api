const express = require('express')
const app = express()
const port = 3000
const { User } = require('./models')
const bodyParser = require('body-parser')
const { Op } = require('sequelize')
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const requiredBody = ['name', 'email']

const cors = require('cors')

app.use(cors())
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/list', async (req, res) => {
  const headers = req.headers
  console.log(headers)
  const result = await User.findAll()
  res.send(result)
})

app.post('/create', async (req, res) => {
  const keys = Object.keys(req.body)
  try {
    requiredBody.map(each => {
      if(!keys.includes(each)) {
        throw {
          message: `${each} is required`
        }
      }
    })
    const existUser = await User.findAll({
      where: {
        [Op.or]: [{
          name: req.body.name
        }, {
          email: req.body.email
        }]
      }
    })

    if(existUser.length > 0) {
      throw {
        message: `User is exist`
      }
    }

    const result = await User.create(req.body)
    res.status(201).send(result)
  } catch (err) {
    res.status(400).send(err)
  }
})

app.put('/edit/:id', async (req, res) => {
  const { id } = req.params
  const { body } = req
  const bodyKeys = Object.keys(body)
  try {
    if(!(id > 0)) throw { message: "Please input valid id" }
    const existUser = await User.findOne({ where: { id } })

    if(!existUser) throw { message: "User not found" } 

    bodyKeys.map(each => {
      if(!requiredBody.includes(each)) throw { message: "invalid parameter" }
    })

    await User.update(body, { where : { id } })
    res.status(202).send(await User.findOne({ where: { id } }))
  } catch (err) {
    res.status(400).send(err)
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})