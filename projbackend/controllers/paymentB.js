var braintree = require("braintree");

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "6qsm8xz2n5962h26",
  publicKey: "2hc3j5nrdp6rjcnk",
  privateKey: "3d306a840059c98d62b1381a69f90af2"
});

exports.getToken = (req, res) => {
    gateway.clientToken.generate({}, function (err, response) {
        if(err){
            res.status(500).send(err)
        } else {
            res.send(response)
        }
      });
}


exports.processPayment = (req, res) => {
    let nonceFromTheClient = req.body.paymentMethodNonce

    let amountFromClient = req.body.amount

    gateway.transaction.sale({
        amount: amountFromClient,
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true
        }
      }, function (err, result) {
        if(err){
            res.status(500).send(err)
        } else {
            res.send(result)
        }
      });
    
}