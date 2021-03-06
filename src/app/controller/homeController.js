const Order = require('../model/order')
const Product = require('../model/product');
const Category = require('../model/category');
const Post = require("../model/post");
const nodemailer =  require("nodemailer");
class homeControllers{
    index(req,res){
        var bestseller = "bestseller";
        var dataPost = Post.find().lean().limit(8);
        Promise.all([Category.find().lean(),Product.find({status:bestseller}).lean().limit(12),dataPost])
        .then(([dataCate,dataProduct,dataPost])=>{

            res.render('clientPage/home',{dataCategory:dataCate,dataProducts:dataProduct,dataPost:dataPost});
        })
        .catch(()=>{
            res.render("partials/Somethingwrong");
        })
    }
    detailProduct(req,res){
        var slug = req.params.slug;
        Product.findOne({slug:slug}).lean()
        .then(data=>{
                var sizeName = data.Size.nameSize;
                var sizeValue = data.Size.extraSize;
                var newsize = sizeName.map((size,index)=>{
                    return {name:size,value:sizeValue[index]};
                })  
                res.render('clientPage/detailProduct',{product:data,size:newsize})
        })
        .catch(()=>{
            res.render("partials/Pagenotfound");
        })
            
    }
    products(req,res){
       var slug = req.params.slug;
       Category.findOne({slug:slug}).lean().then(data=>{
            var product = Product.find({$and:[
                {idCategory:data._id},
                {status:{$in:["ready","bestseller"]}}
            ]}).lean()
            Promise.all([Category.find().lean(),product])
            .then(([dataCate,dataProduct])=>{
                res.render('clientPage/products',{dataCategory:dataCate,dataProducts:dataProduct});
            })
            .catch(()=>{
                res.render("partials/Somethingwrong");
            })
       })
       .catch((err)=>{
           res.render("partials/Pagenotfound")
       })
    }
    getProduct(req,res,next){
        var idProduct=req.query.id;
        Product.findById({_id:idProduct}).lean()
        .then(data=>{
            res.json(data);
        })
     }
    storeOrder(req,res){
        var idDonHang =  Date.now()+makeid(4);
        Order.find({idOrder:idDonHang})
        .lean()
       .then(data=>{
           if(data.length >0){
                res.send('??a?? co?? ma?? na??y r????i,vui lo??ng th???? la??i');
           }else{
                var addressOrder=req.body.addressOrder;
                var hotenOrder =req.body.hotenOrder;
                var sdtOrder =req.body.sdtOrder;
                var noteOrder= req.body.noteOrder;
                var hotenOrder = req.body.hotenOrder;
                var sdtOrder = req.body.sdtOrder;
                var payment = req.body.payment;
                var priceTotal = req.body.priceTotal;
                var listProduct = req.body.listProductOrder;
                var priceCharge = req.body.priceCharge;
                var priceCoupon = req.body.priceCoupon;
                var nameCoupon = req.body.nameCoupon;
                var statusOrder = req.body.statusOrder;
                const newOrder = new Order({
                    idOrder:idDonHang,
                // priceStandard:{type:Number},
                    noteOrder,
                    hotenOrder,
                    priceCharge,
                    sdtOrder,
                    payment,
                    addressOrder,
                    priceTotal,
                    priceCoupon,
                    nameCoupon,
                    statusOrder,
                    listProductCart:listProduct,
                })
                newOrder.save(function(err) {
                    if(err){
                        res.json(err);
                    }else{
                        res.json({idOrder:newOrder.idOrder});
                    }
                })
                
           }
              
       })

       
    }
    cart(req,res){
        res.render('clientPage/cart')
    }
    sendMail(req, res) {
        //Ti???n h??nh g???i mail, n???u c?? g?? ???? b???n c?? th??? x??? l?? tr?????c khi g???i mail
        var address =req.body.address;
        var idOrder = req.body.idOrder; 
        var priceTotal = req.body.priceTotal;
        var name = req.body.name;
        var transporter =  nodemailer.createTransport({ // config mail server
            service: 'gmail',
            auth: {
                user: 'dautestdau@gmail.com',
                pass: 'singsangsung@'
            }
        });
        var content = '';
        content += `
        <div style="background-color:#ffffff;color:#000000"><div class="adM">
        </div>     
          <center>
          <img src="https://image.bnews.vn/MediaUpload/Org/2021/01/23/the-coffee-house2.jpg" width="50%" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 897.797px; top: 542.5px;"><div id=":29u" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="T???i xu???ng t???p ????nh k??m " data-tooltip-class="a1V" data-tooltip="T???i xu???ng"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div><br>
          <div style="width:90%;margin-top:32px">
          <h1 style="font-family:'AvenirNext Medium',Roboto,Helvetica,sans-serif!important;font-weight:bold;color:#fb8f19">????n h??ng c???a b???n ???? ???????c ti???p nh???n!</h1><br>
                <p style="text-align:left;font-family:'AvenirNext Medium',Roboto,Helvetica,sans-serif!important">Ch??o ${name},</p>
                <p style="text-align:left;font-family:'AvenirNext Medium',Roboto,Helvetica,sans-serif!important">Qu???n c?? ph?? The Coffee House ???? ti???p nh???n ????n h??ng c???a b???n. Ch??ng t??i ??ang s??? g???i l???i b???n ????? x??c nh???n ????n h??ng. <b>M?? v???n ????n c???a b???n l?? ${idOrder}</b></p>
                <table style="background-color:#f2f2f2;margin-top:32px;width:100%">
                    <tbody><tr style="background-color:#fb8f19">
                        <td style="padding:16px;color:#ffffff" colspan="2"><b>Th??ng tin giao h??ng chi ti???t</b></td>
                    </tr>
                    <tr>
                        <td width="50%" style="padding:16px"><b>?????a ch??? giao h??ng:</b><br>${address}</td>
                    </tr>
                    <tr>
                        <td width="50%" valign="top" style="padding:16px"><b>COD:</b><br>
                        C??, ${priceTotal.toLocaleString('de-DE')}. Vui l??ng chu???n b??? ti???n m???t tr?????c khi giao h??ng</td>
                    </tr>
                </tbody></table>
            </div>
            </center>
          
          <center>
          <div style="margin-top:64px">
              <a href="http://localhost:3030/getOrder?id=${idOrder}" style="text-decoration:none;width:178px;height:58px;background-color:#fb8f19;color:#ffffff;font-size:19px;font-weight:bold;border-radius:4px;padding:16px 16px;font-family:'AvenirNext Medium',Roboto,Helvetica,sans-serif!important" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://u19783142.ct.sendgrid.net/ls/click?upn%3D6Uh0rL3QRKTvYhPPwrGmBBxHNUFhMIKQqX3Epk5P1GAUoIZbU7fMsGwQ1CrbZ2mttCNp_hDMc5LTXE4uJ6pdKJJe9QK49alNC1aekZeO1fB3mYQi5yMqlDmude-2B07lkTt-2Btf198I6TMxYHFsg4Yz81dLyJGv-2F3IjxFIlv-2BUgeXoLmzmATxNG64CKbPFIr70jAlBd0mjVCpbSHrqEd-2B2z-2FGxXla1wEcN187Bxc9xtM-2F-2FIVD45VpUYwJbvQl90HKajIHP8WJBipoRzJDZAB14h02-2BcqN5frBSWmI7k057YQSZBBmuErB1nverY4iEhTlBuILjXCX-2Fnp53fg1tNPSm1DnHjr1A9Yuby1XjuNQxVySFvzDjaqehDoMEiThcJe-2FMHrk6mJrzWutTFwkMPmAIOIGjSNxuc-2B57rwko9vmX4PtoG-2B36liiKDOh0rtqlwS-2FH3ahS73kaSTBNZVFRIWn8MIwZUlZKFZmfx5yrgHW9iLzgzLDFg-3D&amp;source=gmail&amp;ust=1639997412661000&amp;usg=AOvVaw0lOODECEnH5FUGsWBaTQma">Theo d??i ????n h??ng</a>
          </div>
          </center>   
        </div>
        `;
        var mainOptions = { // thi???t l???p ?????i t?????ng, n???i dung g???i mail
            from: "Qu??n c?? ph?? The Coffe House <dautestdau@gmail.com>",
            to: req.body.mail,
            subject: '?????t h??ng th??nh c??ng',
            text: '',//Th?????ng thi m??nh kh??ng d??ng c??i n??y thay v??o ???? m??nh s??? d???ng html ????? d??? edit h??n
            html: content //N???i dung html m??nh ???? t???o tr??n kia :))
        }
        transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                console.log(err);
                //req.flash('mess', 'L???i g???i mail: '+err); //G???i th??ng b??o ?????n ng?????i d??ng
                res.redirect('/');
            } else {
                console.log("G???i th??nh c??ng");
                res.json("ok");
            }
        });
    };
    checkOrder(req,res){
        res.render("clientPage/checkOrder",{msg:"Theo d??i ????n h??ng c???a b???n b???ng c??ch nh???p m?? ????n h??ng v??o m???c ph??a tr??n."});
    }
    getOrder(req,res){
        var idOrder = req.query.id;
        Order.findOne({idOrder:idOrder}).lean()
        .then(order=>{
            var listProductCart = order.listProductCart;           
            //res.json(listProductCart);
           res.render("clientPage/checkOrder",{data:order,cartProduct:listProductCart})
        })
        .catch(()=>{
            res.render("clientPage/checkOrder",{msg:"Ch??ng t??i kh??ng t??m th???y ????n h??ng c???a b???n. M?? ????n h??ng kh??ng h???p l??? ho???c ???? h???t h???n. Vui l??ng ki???m tra l???i m?? ????n h??ng b???n ???? nh???p."});
        })
    }
    detailPost(req,res){
        var slug = req.params.slug;
        Post.findOne({slug:slug}).lean()
        .then(data=>{
                res.render('clientPage/detailPost',{post:data});
        })
    }
    getAllProduct(req,res){
        var product =Product.find({status:{$in:["ready","bestseller"]}}).lean()
        Promise.all([Category.find().lean(),product])
            .then(([dataCate,dataProduct])=>{
                res.render('clientPage/allProduct',{dataCategory:dataCate,dataProducts:dataProduct});
            })
            .catch(()=>{
                res.render("partials/Somethingwrong");
            })
    }
    getAllPost(req,res){
        Post.find().lean()
        .then(data=>{
            res.render("clientPage/allPost",{data:data});
        })
    }
    
    create_payment_url(req, res, next) {
        var ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        var dateFormat = require('dateformat');
        var vnp_HashSecret = "WZYWFWSEXFIPQFIKBBURLRHTMXPMRTZV";
        var vnp_TmnCode = "7FJPJWEL";
        var vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        var vnp_ReturnUrl = "http://localhost:3030/vnpay_return";
        var vnp_data = "https://sandbox.vnpayment.vn/merchant_webapi/merchant.html";  
        var tmnCode = vnp_TmnCode;
        var secretKey = vnp_HashSecret;
        var vnpUrl = vnp_Url;
        var returnUrl = vnp_ReturnUrl;
        var date = new Date();
        var createDate = dateFormat(date, 'yyyymmddHHmmss');
        var orderId = dateFormat(date, 'HHmmss');
        var amount = req.body.priceTotal;
        var bankCode = "NCB";//req.body.bankCode;
        var orderInfo = "Thanh to??n ????n h??ng coffehouse";//req.body.orderDescription;
        var orderType = "billpayment"//req.body.orderType;
        var locale = "vn"//req.body.language;
        if(locale === null || locale === ''){
            locale = 'vn';
        }
        var currCode = 'VND';
        var vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        // vnp_Params['vnp_Merchant'] = ''
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = orderType;
        vnp_Params['vnp_Amount'] = amount*100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if(bankCode !== null && bankCode !== ''){
            vnp_Params['vnp_BankCode'] = bankCode;
        }
        vnp_Params = sortObject(vnp_Params);
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");     
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        res.json(vnpUrl);
    };
    
    vnpay_return(req, res, next) {
        var vnp_Params = req.query;
        var secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        vnp_Params = sortObject(vnp_Params);
        var vnp_HashSecret = "WZYWFWSEXFIPQFIKBBURLRHTMXPMRTZV";
        var vnp_TmnCode = "7FJPJWEL";
        var tmnCode = vnp_TmnCode;
        var secretKey = vnp_HashSecret;
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");     
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
        if(secureHash === signed){
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
            //res.json(vnp_Params['vnp_ResponseCode]']);
            var amount = parseFloat(req.query.vnp_Amount)/100;
            var bank =req.query.vnp_BankCode;
            var numberTran =req.query.vnp_BankTranNo;
            var contentTran =req.query.vnp_OrderInfo;
            var dateFormat = require('dateformat');
            var date = req.query.vnp_PayDate
            var year = parseInt (date.substr(0,4));
            var month = parseInt (date.substr(4,2));
            var day = parseInt (date.substr(6,2));
            var hour = parseInt (date.substr(8,2));
            var min = parseInt (date.substr(10,2))
            var second = parseInt (date.substr(12,2));
            console.log(month);
            let timeTran = new Date(year,month-1,day,hour,min,second,30);
            console.log(timeTran);
            var data =[
                {
                    name:"S??? giao d???ch",
                    value:numberTran,
                    des:"???????c c???p b???i VNPAY",
                },
                {
                    name:"Ng??n h??ng",
                    value:bank,
                    des:"Ng??n h??ng GD",
                },
                {
                    name:"Th???i gian",
                    value: dateFormat(timeTran,"default"),
                    des:"Th???i gian th???c hi???n giao d???ch",
                },
                {
                    name:"N???i dung",
                    value:contentTran,
                    des:"Th??ng tin m?? t??? t??? website merchant",
                },
                {
                    name:"S??? ti???n",
                    value:amount.toLocaleString("de-DE")+" VND",
                    des:"S??? ti???n giao d???ch",
                },
            ]
            res.render('clientPage/success', {code:req.query.vnp_ResponseCode,data:data})
        } else{
            res.render('success', {code: '97'})
        }
    };
   
}
function sortObject(obj) {
    var sorted = {};
    var str = [];
    var key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
function makeid(length) {
    var result           = '';
    var characters       = '123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
module.exports = new homeControllers;