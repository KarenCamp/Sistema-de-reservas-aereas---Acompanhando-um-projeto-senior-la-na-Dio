import React, { useState, useEffect } from "react";
import {
    Row,
    Col,
    UncontrolledDropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem,
    Input,
    Button
} from "reactstrap";

import Table from "./table";

export default props => {
    const [totalTables, setTotalTables] = useState([]);

    //Seleções do usuário

    const [selection, setSelection] = useState({
        table: {
            name: null,
            id: null
        },
        date: new Date(),
        time: null,
        location: "Local",
        size: 0
    });

    //Dados da reserva do usuário
    const [booking, setBooking] = useState({
        name: "",
        phone: "",
        email: ""
    });

    //Locais

    const [locations] = useState(["Curitiba", "São Paulo", "Maceió", "Recife", "Minas Gerais"]);
    const [times] = useState([
        "9AM",
        "10AM",
        "11AM",
        "12AM",
        "1PM",
        "2PM",
        "3PM",
        "4PM",
        "5PM",
    ]);

    //Validações de reserva

    const [reservationError, setReservationError] = useState(false);
    const getDate = _ => {
        const months = [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro"
        ];
        const date = months[selection.date.getMonth()] + " " + selection.date.getDate() + selection.date.getFullYear();
        let time = selection.time.slide(0, -2);
        time = selection.time > 12 ? time + 12 + ":00" : time + ":00";
        console.log(time);
        const dateTime = new Date(date + " " + time);
        return dateTime;
    };
    const getEmptyTables = _ => {
        let tables = totalTables.filter(table => table.isAvailable);
        return tables.length;
    };

    //Verificar disponibilidade de assentos na data e hora selecionadas
    useEffect(() => {
        if (selection.time && selection.date) {
            (async _ => {
                let dateTime = getDate();
                let res = await fetch("https://localhost:4005/availability", {
                    method: "POST",
                    headers: {
                        "Content-Type": "Application/json"
                    },
                    body: JSON.stringify({
                        date: dateTime
                    })
                });
                res = await res.json();
                //Mostrar apenas assentos disponíveis
                let tables = res.tables.filter(
                    table =>
                        (selection.size > 0 ? table.capacity >= selection.size : true) &&
                        (selection.location !== "Local" ? table.location == selection.location : true)
                );
                setTotalTables(tables);
            })();
        }
    }, [selection.time, selection.date, selection.size, selection.location]);

    //Fazer a reserva se todos os dados estiverem preenchidos

    const reserve = async _ => {
        if (
            (booking.name.length === 0)
            (booking.phone.length === 0)
            (booking.email.length === 0)
        ) {
            console.log("Complete seus dados!");
            setReservationError(true);
        } else {
            const dateTime = getDate();
            let res = await fetch ("https://localhost:4005/reserve", {
                method: "POST",
                    headers: {
                        "Content-Type": "Application/json"
                    },
                    body: JSON.stringify({
                        ...booking,
                        date: dateTime,
                        table: selection.table.id
                    })
                });
                res = await res.text();
                console.log("Reserva: " + res);
                props.setPage(2);
    }
  };

  // Clicking on a table sets the selection state
  const selectTable = (table_name, table_id) => {
    setSelection({
      ...selection,
      table: {
        name: table_name,
        id: table_id
      }
    });
  };

  // Gerar um menu responsivo de acordo com os assentos disponíveis
  const getSizes = _ => {
    let newSizes = [];

    for (let i = 1; i < 8; i++) {
      newSizes.push(
        <DropdownItem
          key={i}
          className="booking-dropdown-item"
          onClick={e => {
            let newSel = {
              ...selection,
              table: {
                ...selection.table
              },
              size: i
            };
            setSelection(newSel);
          }}
        >
          {i}
        </DropdownItem>
      );
    }
    return newSizes;
  };

  // Generate locations dropdown
  const getLocations = _ => {
    let newLocations = [];
    locations.forEach(loc => {
      newLocations.push(
        <DropdownItem
          key={loc}
          className="booking-dropdown-item"
          onClick={_ => {
            let newSel = {
              ...selection,
              table: {
                ...selection.table
              },
              location: loc
            };
            setSelection(newSel);
          }}
        >
          {loc}
        </DropdownItem>
      );
    });
    return newLocations;
  };

  // Generate locations dropdown
  const getTimes = _ => {
    let newTimes = [];
    times.forEach(time => {
      newTimes.push(
        <DropdownItem
          key={time}
          className="booking-dropdown-item"
          onClick={_ => {
            let newSel = {
              ...selection,
              table: {
                ...selection.table
              },
              time: time
            };
            setSelection(newSel);
          }}
        >
          {time}
        </DropdownItem>
      );
    });
    return newTimes;
  };

  // Generating tables from available tables state
  const getTables = _ => {
    console.log("Getting tables");
    if (getEmptyTables() > 0) {
      let tables = [];
      totalTables.forEach(table => {
        if (table.isAvailable) {
          tables.push(
            <Table
              key={table._id}
              id={table._id}
              chairs={table.capacity}
              name={table.name}
              empty
              selectTable={selectTable}
            />
          );
        } else {
          tables.push(
            <Table
              key={table._id}
              id={table._id}
              chairs={table.capacity}
              name={table.name}
              selectTable={selectTable}
            />
          );
        }
      });
      return tables;
    }
  };

  return (
    <div>
      <Row noGutters className="text-center align-items-center assento-cta">
        <Col>
          <p className="looking-for-assento">
            {!selection.table.id ? "Reserve um assento" : "Confirme seus dados"}
            <i
              className={
                !selection.table.id
                  ? "fas fa-chair assento"
                  : "fas fa-clipboard-check assento"
              }
            ></i>
          </p>
          <p className="selected-table">
            {selection.table.id
              ? "Você está reservando o " + selection.table.name
              : null}
          </p>

          {reservationError ? (
            <p className="reservation-error">
              * Please fill out all of the details.
            </p>
          ) : null}
        </Col>
      </Row>

      {!selection.table.id ? (
        <div id="reservation-stuff">
          <Row noGutters className="text-center align-items-center">
            <Col xs="12" sm="3">
              <input
                type="date"
                required="required"
                className="booking-dropdown"
                value={selection.date.toISOString().split("T")[0]}
                onChange={e => {
                  if (!isNaN(new Date(new Date(e.target.value)))) {
                    let newSel = {
                      ...selection,
                      table: {
                        ...selection.table
                      },
                      date: new Date(e.target.value)
                    };
                    setSelection(newSel);
                  } else {
                    console.log("Invalid date");
                    let newSel = {
                      ...selection,
                      table: {
                        ...selection.table
                      },
                      date: new Date()
                    };
                    setSelection(newSel);
                  }
                }}
              ></input>
            </Col>
            <Col xs="12" sm="3">
              <UncontrolledDropdown>
                <DropdownToggle color="none" caret className="booking-dropdown">
                  {selection.time === null ? "Selecione um horário" : selection.time}
                </DropdownToggle>
                <DropdownMenu right className="booking-dropdown-menu">
                  {getTimes()}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col xs="12" sm="3">
              <UncontrolledDropdown>
                <DropdownToggle color="none" caret className="booking-dropdown">
                  {selection.location}
                </DropdownToggle>
                <DropdownMenu right className="booking-dropdown-menu">
                  {getLocations()}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col xs="12" sm="3">
              <UncontrolledDropdown>
                <DropdownToggle color="none" caret className="booking-dropdown">
                  {selection.size === 0
                    ? "Número de passageiros"
                    : selection.size.toString()}
                </DropdownToggle>
                <DropdownMenu right className="booking-dropdown-menu">
                  {getSizes()}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
          </Row>
          <Row noGutters className="tables-display">
            <Col>
              {getEmptyTables() > 0 ? (
                <p className="available-tables">{getEmptyTables()} available</p>
              ) : null}

              {selection.date && selection.time ? (
                getEmptyTables() > 0 ? (
                  <div>
                    <div className="table-key">
                      <span className="empty-table"></span> &nbsp; Available
                      &nbsp;&nbsp;
                      <span className="full-table"></span> &nbsp; Unavailable
                      &nbsp;&nbsp;
                    </div>
                    <Row noGutters>{getTables()}</Row>
                  </div>
                ) : (
                  <p className="table-display-message">Sem reservas disponíveis </p>
                )
              ) : (
                <p className="table-display-message">
                  Selecione uma data e um horário para a sua reserva
                </p>
              )}
            </Col>
          </Row>
        </div>
      ) : (
        <div id="confirm-reservation-stuff">
          <Row
            noGutters
            className="text-center justify-content-center reservation-details-container"
          >
            <Col xs="12" sm="3" className="reservation-details">
              <Input
                type="text"
                bsSize="lg"
                placeholder="Nome"
                className="reservation-input"
                value={booking.name}
                onChange={e => {
                  setBooking({
                    ...booking,
                    name: e.target.value
                  });
                }}
              />
            </Col>
            <Col xs="12" sm="3" className="reservation-details">
              <Input
                type="text"
                bsSize="lg"
                placeholder="Número de telefone"
                className="reservation-input"
                value={booking.phone}
                onChange={e => {
                  setBooking({
                    ...booking,
                    phone: e.target.value
                  });
                }}
              />
            </Col>
            <Col xs="12" sm="3" className="reservation-details">
              <Input
                type="text"
                bsSize="lg"
                placeholder="Email"
                className="reservation-input"
                value={booking.email}
                onChange={e => {
                  setBooking({
                    ...booking,
                    email: e.target.value
                  });
                }}
              />
            </Col>
          </Row>
          <Row noGutters className="text-center">
            <Col>
              <Button
                color="none"
                className="book-table-btn"
                onClick={_ => {
                  reserve();
                }}
              >
                Finalizar reserva
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};
