import React, { Component } from "react";
import "../CSS/caisse.css"
import {Ip}   from "../Server/Ip.js";
import {Col, Row} from 'react-bootstrap';

class Caisse extends Component{
    constructor(){
        super()
        this.state = {
            product : ''
        }
    }
    componentWillMount(){
        this.setState({ product : this.props.idProduct })
    }

    delete (){
      this.props.delete(this.state.product,this.props.k);
    }
    add (){
      this.props.add(this.state.product);
    }
    minus (){
      this.props.minus(this.state.product);
    }


    render(){
        return(
            <div className="productC" >
              <Row>
                <Col xs={7} className="label">
                  {this.props.idProduct.nom}
                </Col>
                <Col xs={3} className="prix" >
                  {((this.props.idProduct.prix)*this.props.idProduct.qte).toFixed(3) } Dt
                </Col>
                <Col xs={1}>
                <button className="deleteBtn" onClick={this.delete.bind(this)}><i className="fa fa-trash-o"></i></button>
                </Col >

              <div>
              <span>
                <button className="addMinusBtn" onClick={this.minus.bind(this)}><i className="fa fa-minus-circle"></i></button>
              </span>
              <span className="quantité" >
                Qte : {this.props.idProduct.qte}
              </span>
              <span>
                <button className="addMinusBtn" onClick={this.add.bind(this)}><i className="fa fa-plus-circle"></i></button>
              </span>
              </div>
            </Row>
          </div>
        )
    }
}

export default Caisse
