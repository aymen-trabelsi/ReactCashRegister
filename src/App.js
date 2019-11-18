import React, { Component } from "react";
import "./App.css";
import {Modal} from 'react-bootstrap';
import AllProduct from "./Component/allProducts"
import Caisse from "./Component/caisse"
import {Ip}   from "./Server/Ip.js";
import axios from "axios";
import Waiting from "./Waiting.js";
import {Col, Row} from 'react-bootstrap';
import openSocket from 'socket.io-client';
import kidsPay from './Images/kidsPay.png'
const  socket = openSocket('http://192.168.1.64:3000');
const  socketP = openSocket('http://79.137.75.40:3000');


class App extends Component {

  constructor(){
    super()
    this.state = {
      code : 0 ,
      exist : false,
      idProducts : [],
      prixTotal : 0,
      listProduct : [],
      keyGenerator : 0,
      prod : [],
      loaded :false,
      show : false,
      DT : " DT",
      totale : "disabled",
      payer  : " Payer ",
      newProduct : 0,
    }
    this.subscribeToTimer((code) => this.setState({ code : code }));
    this.subscribeToTimerP((newProduct) => this.setState({ newProduct : newProduct }));
  }
  subscribeToTimer(cb) {
    socket.on('new code' , code => cb(code));
  }
  subscribeToTimerP(cb) {
    socketP.on('new product' , newProduct => cb(newProduct));
  }

  refreshListProduct(){
    this.setState({ loaded : false})
    let url= Ip.url;
    axios.get(url+"kidspay/getAllProductsByStoreId/?idStore=1").then(res => {
        res.data.map(prod => {
        prod.filtred=true;
        return(true)
      })
      this.setState({
        prod: res.data,
        loaded: true
      });
    });
  }

  componentWillMount() {
    let url= Ip.url;
    axios.get(url+"kidspay/getAllProductsByStoreId/?idStore=1").then(res => {
        res.data.map(prod => {
        prod.filtred=true;
        return(true)
      })
      this.setState({
        prod: res.data,
        loaded: true
      });
    });

  }


  getIdProduct(ids){
    this.state.exist = false;
    let idProd = this.state.idProducts;
    if(this.state.idProducts.length>0){
      idProd.map(idP => {
        if(ids[0].id===idP.id){
          this.state.exist = true;
          idP.qte=idP.qte+1;
        }
        return(true)
      })
      this.setState({ idProducts : idProd})

      if(this.state.exist===false){
        let prod = {};
        prod.qte=1;
        prod.id=ids[0].id;
        prod.nom=ids[0].nom;
        prod.prix=ids[0].prix;
        idProd.push(prod);
        this.setState({ idProducts : idProd})
      }
    }else {
      let prod = {};
      prod.qte=1;
      prod.id=ids[0].id;
      prod.nom=ids[0].nom;
      prod.prix=ids[0].prix;
      idProd.push(prod);
      this.setState({ idProducts : idProd})
    }
  }

  async deleteProduct(p , k){
      if(true){
      let idProd = this.state.idProducts;
      let aux  = [];
      let total = 0;
      idProd.map((idP , key) => {
        if(key === k ){
          total = idP.prix * idP.qte ;
        }else {
          aux.push(idP)
        }
        return(true)
      })
      this.setState({idProducts : aux })
      if(this.state.prixTotal - total <= 0 ){
        this.state.prixTotal = 0;
      }else{
        this.state.prixTotal = this.state.prixTotal - total ;
      }
    }
  }

  addProduct(p){
    let total = 0;
    let idProd = this.state.idProducts;
    idProd.map(idP => {
      if(p.id==idP.id){
        idP.qte=idP.qte+1;
        total = idP.prix  ;
      }
      return(true)
    })
    this.setState({idProducts : idProd});
    this.state.prixTotal = total + this.state.prixTotal ;

  }

  minusProduct(p){
    let total = 0;
    let idProd = this.state.idProducts;
    idProd.map(idP => {
      if(p.id==idP.id){
        if(idP.qte>1){
          idP.qte=idP.qte-1;
          total = idP.prix  ;
        }else {
        }
      }
      return(true)
    })
    this.setState({idProducts : idProd});
    this.state.prixTotal = this.state.prixTotal - total ;
  }

  calculTotal(produits){
      this.state.prixTotal=0;
      this.state.prod.map(idP => {
        if(this.state.idProducts.length===0){
          produits.map(prod => {
            if(prod.id==idP.id){
              this.state.prixTotal = this.state.prixTotal + prod.prix*prod.qte ;
            }
            return(true)
            })
        }else {
            this.state.idProducts.map(prod => {
              if(prod.id==idP.id){
                this.state.prixTotal =  this.state.prixTotal + (prod.prix)*prod.qte ;
              }
              return(true)
              })
        }
        return(true)
      })
  }

  getAllProducts(){
        if(this.state.payer==="Paiement effectué avec succès"){
          this.setState({payer : "Payer"});
        }
       if((this.state.payer==="Ce tag n'appartient à aucun enfant.")||
          (this.state.payer==="Compte bloqué")||
          (this.state.payer==="Solde insuffisant")) {
            this.getAllProducts();
          }else if (this.state.payer==="Approchez votre TAG NFC"){
          }else {
            if(this.state.idProducts.length===0){
              this.setState({show: true});
              }else {
              let url= Ip.rpiURL;
              axios.get(url+"pim/ws/setDemande.php").then(res => {
               this.setState({prixFinal : this.state.prixTotal});
               this.setState({payer : "Approchez votre TAG NFC"});
             }).catch(error => {
               console.log("error")
             })
             this.fetchTag();
           }
         }
  }

  fetchTag(){
    let url= Ip.rpiURL;
    axios.get(url+"pim/ws/selectTag.php").then(res => {
      if(res.data==null){
        console.log("waiting")
        this.fetchTag();
      }else {
        let temp = {};
        temp.idTag = res.data;
        temp.idStore = 1 ;
        temp.prixFinal = (this.state.prixFinal).toFixed(3);
        let list = this.state.idProducts;
        list.push(temp);
        let url =Ip.url+"kidspay/AdvancedPaiement/"
        axios.post(url,list).then(res => {
          this.setState({payer : res.data});
          if(res.data ==="Paiement effectué avec succès"){
            this.setState({idProducts : []});
            this.setState({prixTotal :0});
          }
          let aux = [];
          this.state.idProducts.map((ids , key) => {
            if(this.state.idProducts.length === key+1 ){

            }else {
              aux.push(ids)
            }
          })
          this.setState({ idProducts :aux });
        })
      }
    })
  }

  onClose = () => {
  this.setState({
     show: false
  });
}
  inString(s1, s2) {
   let m = s1.length;
   let n = s2.length;
   for (let i = 0; i <= n - m; i++) {
      let j;
      for (j = 0; j < m; j++)
         if (s2[i + j] !== s1[j])
            break;
   if (j === m)
         return true;
      }
   return false;
}

  seachTable = () => {
   let array = this.state.prod.slice();
   for (let i = 0; i < array.length; i++) {
      if (this.inString((this.refs.nom.value).toUpperCase(), (array[i].nom).toUpperCase()))
      {
         array[i].filtred = true;
      } else {
         array[i].filtred = false
      }
   }
   this.setState({prod: array});
}

 Tous = () => {
   let array = this.state.prod.slice();
   for (let i = 0; i < array.length; i++) {
        array[i].filtred = true;
   }
   this.setState({prod: array});
}

 Boisson = () => {
   let array = this.state.prod.slice();
   for (let i = 0; i < array.length; i++) {
     if(array[i].categorie === "Boisson"){
       array[i].filtred = true;
     }else {
       array[i].filtred = false;
     }
   }
   this.setState({prod: array});
}

 Alimentation = () => {
   let array = this.state.prod.slice();
   for (let i = 0; i < array.length; i++) {
     if(array[i].categorie === "Alimentation"){
       array[i].filtred = true;
     }else {
       array[i].filtred = false;
     }
   }
   this.setState({prod: array});
 }

  ajouterParCB(code){
    let test = true ;
    let temp = [];
    let prod = {};
    this.state.prod.map( p => {
      if((p.code === code)||(p.code === this.refs.codeBare.value)){
        prod.qte=1;
        prod.id=(p.id).toString();
        prod.nom=p.nom;
        prod.prix=p.prix;
        temp.push(prod)
        this.getIdProduct(temp)
        this.calculTotal(temp)
        test = false ;
      }
    })
    if (test) {
        console.log("code introuvable")
    }
  }

  clearAll(){
    let temp = [];
    this.setState({ idProducts : temp})
    this.setState({ prixTotal : 0})
    this.setState({ payer : "Payer"})
 }
  render() {
    let  produit =    <div className='wrapper'> <Waiting /> </div>
    if(this.state.code === 0){
    }else {
      this.ajouterParCB(this.state.code)
      this.state.code = 0 ;
    }

    if(this.state.newProduct === 0){

    }else {
      console.log(this.state.newProduct)
      this.refreshListProduct();
      this.state.newProduct = 0 ;
    }

    if(this.state.loaded){
         produit =    <AllProduct all={this.state.prod}  idProduct={this.getIdProduct.bind(this)} prixProduct={this.calculTotal.bind(this)}/>
    }
    let total = (this.state.prixTotal)

    return (
      <div>

      <Modal show={this.state.show}>
         <form>
            <Modal.Body>
              <p align="center" >Vous n'avez pas choisire des articles </p>
            </Modal.Body>
            <Modal.Footer>
            <button type="button" className="btn btn-primary" onClick={() => { this.onClose() }} >Fermer</button>
            </Modal.Footer>
         </form>
      </Modal>

      <div className="container-fluid">
        <Row>
          <Col xs={7}>
          <h2 align="center" > <img src={kidsPay} className="imageKP"/>  </h2>

            <Row >
              <Col xs={4} className="header">
                <button   className="btnAll" type="button" onClick={this.Tous.bind(this) }>   Tous   </button>
              </Col>
              <Col xs={4} className="header">
                <button  className="btnAll" type="button" onClick={this.Boisson.bind(this) }>Boisson</button>
              </Col>
              <Col xs={4} className="header">
                <button  className="btnAll" type="button" onClick={this.Alimentation.bind(this) }>Alimentation</button>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <div className="input-group mb-3">
                  <input type="hidden" id="code" ref="code" className="form-control" placeholder="Code à barre" autoFocus  aria-label="Recipient's username" aria-describedby="basic-addon2"/>
                  <input type="number" id="codeBare" ref="codeBare" className="form-control" placeholder="Code à barre" autoFocus  aria-label="Recipient's username" aria-describedby="basic-addon2"/>
                  <div className="input-group-append">
                    <button className="btn btn-outline-primary" type="button" onClick={this.ajouterParCB.bind(this) }>Ajouter</button>
                  </div>
                </div>
              </Col>
            </Row>
            {produit}
          </Col>
          <Col xs={5} className="caisse">
            <div className="fix">
              <div className="products">
                {
                  this.state.idProducts.map((id , key) => {
                            return (
                              <div  key={key}>
                              <Caisse idProduct={id} k={key} delete={this.deleteProduct.bind(this)} add={this.addProduct.bind(this)} minus={this.minusProduct.bind(this)}  />
                              </div>
                            )
                          })
                }
                </div>
                <div>
                <Row className='totalText'>
                <Col xs={2}>
                <button className="deleteBtnall" onClick={this.clearAll.bind(this)}><i className="fa fa-trash-o"></i></button>
                </Col>
                <Col xs={4}>
                  <p > Total TTC : </p>
                </Col>
                  <Col xs={4} className="prixTotal">
                  <p> {(this.state.prixTotal.toFixed(3)).toString()}{this.state.DT} </p>
                  </Col>
                </Row>
                </div>
                <Row>
                  <Col xs={12}>
                    <button className='total' onClick={this.getAllProducts.bind(this)}>{this.state.payer}</button>
                  </Col>
                </Row>
            </div>
          </Col>
        </Row>
      </div>
      </div>
    );

}
}

export default App;
