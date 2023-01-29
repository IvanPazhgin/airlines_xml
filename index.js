const fs = require('fs')

readXML2()

function readXML2() {
  const startParsingXML = new Date()
  const pathToXML = './input/backend_xml_responce.xml'
  const iconv = require("iconv-lite")
  const convert = require("xml-js")

  fs.readFile(pathToXML, null, function (err, data) {
    if (err) throw err
    const dataFromXML = iconv.decode(data, "cp1251").toString();
    const xml2JSON = convert.xml2json(dataFromXML, {compact: true, spaces: 2})
    const diffTimeOfParsingXML = timeOfParsing(startParsingXML) // время разбора XML файла
    console.log(`время разбора XML файла = ${diffTimeOfParsingXML} секунд (${(diffTimeOfParsingXML / 60).toFixed(2)} минут)`)
    // saveDataToJSON(xml2JSON) // сохраняем данные в файл

    const dataFromJSON = JSON.parse(xml2JSON) // парсим данные в формат JSON
    const airPorts = getAirports(dataFromJSON) // формируем список аэропортов
    // console.table(airPorts)
    const airLines = getAirLines(dataFromJSON) // формируем список авиакомпаний
    // console.table(airLines)
    const offers = getOffers(dataFromJSON) // формируем список предложений
    // console.table(offers)

    // фильто по аэропортам
    const queryAirport = airPorts[0].name // меняем индекс для нового запроса
    const startFilterByAirports = new Date()
    filterByAirports(queryAirport, airPorts, offers)
    const diffTimeOfFilterByAirports = timeOfParsing(startFilterByAirports) // время разбора XML файла
    console.log(`время обработки фильтра по ${queryAirport} = ${diffTimeOfFilterByAirports} секунд (${(diffTimeOfFilterByAirports / 60).toFixed(2)} минут)`)

    // фильто по авиакомпаниям
    const queryAirLines = airLines[0].name // меняем индекс для нового запроса
    const startFilterByAirLines = new Date()
    filterByAirLines(queryAirLines, airLines, offers)
    const diffTimeOfFilterByAirLines = timeOfParsing(startFilterByAirLines) // время разбора XML файла
    console.log(`время обработки фильтра по ${queryAirLines} = ${diffTimeOfFilterByAirLines} секунд (${(diffTimeOfFilterByAirLines / 60).toFixed(2)} минут)`)
  })
}

// время разбора запроса
function timeOfParsing(startParsingXML) {
  const endParsingXML = new Date()
  return (endParsingXML - startParsingXML) / 1000
}

// сохраняем данные в файл
function saveDataToJSON(data) {
  const pathForJSON = './input/convertedData.json'

  fs.writeFile(pathForJSON, data, 'utf8', (err) => {
    if (err) {
      console.log(`Error writing file: ${err}`)
    } else {
      console.log(`${pathForJSON} is written successfully!`)
    }
  })
}

// формируем список аэропортов
function getAirports(data) {
  const airportsCompact = []
  const airports = data.SearchResult.References.Airports.Item
  airports.forEach(airport => {
    const oneAirPort = {
      code: airport._attributes.Code,
      name: airport._attributes.Name,
      country: airport._attributes.Country,
      city: airport._attributes.City,
    }
    airportsCompact.push(oneAirPort)
  })
  return airportsCompact

  // const offers = dataFromJSON.SearchResult.Offers.Item[0]
  // console.table(offers)
  // const flights = dataFromJSON.SearchResult.Offers.Item[0].Flights.Item[0]
  // console.log(flights)
}

// формируем список авиакомпаний
function getAirLines(data) {
  const airLinesCompact = []
  const airLines = data.SearchResult.References.Airlines.Item
  airLines.forEach(airLine => {
    const oneAirLine = {
      code: airLine._attributes.Code,
      name: airLine._attributes.Name,
    }
    airLinesCompact.push(oneAirLine)
  })
  return airLinesCompact
}

// формируем список предложений
function getOffers(data) {
  const offersComact = []
  const offers = data.SearchResult.Offers.Item
  offers.forEach(offer => {
    const oneOffer = {
      price: offer._attributes.Price,
      isCombined: offer._attributes.IsCombined,
      validatorCode: offer._attributes.ValidatorCode,
      tariffAdult: offer._attributes.tariff_adult,
      charter: offer._attributes.charter,
      isCharterSpecFare: offer._attributes.IsCharterSpecFare,
      directionType: offer._attributes.DirectionType,
      number: offer._attributes.Number,
      hotelVaucher: offer._attributes.HotelVaucher,
      flights: offer.Flights.Item,
    }
    offersComact.push(oneOffer)
  })
  return offersComact
}

// фильто по аэропортам
function filterByAirports(queryAirport, airPorts, offers) {
  const codeAirport = airPorts.filter(airPort => airPort.name === queryAirport)[0].code

  const offersByAirPorts = []
  offers.forEach(offer => {
    offer.flights.forEach(flight => {
      if (flight._attributes.Origin === codeAirport) {
        const oneOffer = {
          codeAirLine: flight._attributes.Code + '-' + flight._attributes.Num,
          depart: flight._attributes.Depart,
          arrive: flight._attributes.Arrive,
          segmentId: flight._attributes.SegmentId,
          isCombined: offer.isCombined,
          charter: offer.charter,
          price: offer.price,
        }
        offersByAirPorts.push(oneOffer)
      }
    })
  })
  console.log(`\nфильтр по аэропортам: ${queryAirport}`)
  console.table(offersByAirPorts)
}

// фильто по авиакомпаниям
function filterByAirLines(queryAirLines, airLines, offers) {
  const codeAirLine = airLines.filter(airLine => airLine.name === queryAirLines)[0].code

  const offersByAirLines = []
  offers.forEach(offer => {
    offer.flights.forEach(flight => {
      if (flight._attributes.Code === codeAirLine) {
        const oneOffer = {
          codeAirLine: flight._attributes.Code + '-' + flight._attributes.Num,
          depart: flight._attributes.Depart,
          arrive: flight._attributes.Arrive,
          segmentId: flight._attributes.SegmentId,
          isCombined: offer.isCombined,
          charter: offer.charter,
          price: offer.price,
        }
        offersByAirLines.push(oneOffer)
      }
    })
  })
  console.log(`\nфильтр по авиакомпаниям: ${queryAirLines}`)
  console.table(offersByAirLines)
}