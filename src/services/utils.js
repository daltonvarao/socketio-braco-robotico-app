module.exports = {
  mapper(givenValue, minGivenValue, maxGivenValue, minExpectedValue, maxExpectedValue) {
    return (givenValue-minGivenValue)*(maxExpectedValue-minExpectedValue)/(maxGivenValue-minGivenValue) + minExpectedValue;
  }
}