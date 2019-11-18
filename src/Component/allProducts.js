import React, { Component } from "react";
import "../CSS/allProducts.css";
import {Ip}   from "../Server/Ip.js";

class AllProducts extends Component {
  constructor() {
    super();
    this.state = {
      prod: [],
      idProducts : [],
      imgURL : Ip.imgURL
    };
    this.getIdProduct=this.getIdProduct.bind(this)
  }

  componentWillMount() {
      this.setState({
        prod: this.props.all
      });
  }

  getIdProduct(e){
    this.setState({idProducts : []});
    let prod = {};
    this.state.prod.map(p => {
      if(p.id==e.target.id){
        prod.qte=1;
        prod.nom=p.nom;
        prod.id=e.target.id;
        prod.prix=p.prix;
        this.state.idProducts.push(prod);
      }
    })

    this.setState({
      idProduct : this.state.idProducts
    },function(){
      this.props.idProduct(this.state.idProduct)
      this.props.prixProduct(this.state.idProduct)
    })

  }
  render() {
    return(
        this.state.prod.map(p => {
          if(p.filtred){
            return(
              <div className="product" key={p.id} id={p.id}  onClick={this.getIdProduct}>
                <div className="informationProduct" id={p.id}>
                  <div className="labelProduct" id={p.id}>
                    <div id={p.id}>
                      <img src={this.state.imgURL+p.photo} alt="label" id={p.id}/>
                      <p id={p.id}>{p.nom}</p>
                      <p id={p.id}>{(p.prix).toFixed(3)} DT</p>
                      </div>
                    </div>
                  <div className="prixProduct" id={p.id}>
                  </div>
                </div>
              </div>
            )
          }
    })
    )
  }
}

export default AllProducts;
