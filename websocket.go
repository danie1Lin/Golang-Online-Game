package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	//"time"
	"./helper"
)

type Player struct {
	hub    *Hub
	conn   *websocket.Conn
	Inputs []Input
	Send   chan interface{}
}

func (p *Player) Recieve() {
	command := &Input{}
	message := &Message{}
	playerXY := p.hub.allData[p.hub.Players[p]]
	for {
		select {
		default:
			err := p.conn.ReadJSON(message)
			if err != nil {
				log.Println(err)
				return
			}
			fmt.Print(message, "  ")
			switch message.Type[:] {
			case "M":
				//move
				helper.MapToStruct(message.Data, command)
				fmt.Print(message, "  ")
				fmt.Println(command)
			}
			if command.Up {

				playerXY.Y -= 5
			}
			if command.Left {
				playerXY.X -= 5
			}
			if command.Down {
				playerXY.Y += 5
			}
			if command.Right {
				playerXY.X += 5
			}
			playerXY.CommandNum = command.CommandNum
			playerLoc := PlayerLoc{
				Id:  p.hub.Players[p],
				Loc: playerXY,
			}
			p.hub.broadcast <- playerLoc
		}
	}
}

func (p *Player) Trans() {
	for {
		select {
		case allData := <-p.Send:
			err := p.conn.WriteJSON(&Message{"COR", allData})
			if err != nil {
				log.Println(err)
				return
			}
		}
	}
}

type Loc struct {
	Stamp      int64
	CommandNum int64
	X, Y       int32
}

type PlayerLoc struct {
	Id string
	Loc
}
type Input struct {
	CommandNum            int64
	Up, Down, Left, Right bool
}

type Message struct {
	Type string
	Data interface{}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func Echo(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	player := &Player{
		hub,
		conn,
		make([]Input, 0),
		make(chan interface{}),
	}
	player.hub.register <- player
	select {
	case id := <-player.Send:
		err = player.conn.WriteJSON(&Message{Type: "ID", Data: id})
	}
	go player.Recieve()
	go player.Trans()
}

func main() {
	hub := createHub()
	go hub.run()
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		Echo(hub, w, r)
	})
	fs := http.FileServer(http.Dir("static/"))
	http.Handle("/", fs)
	if err := http.ListenAndServe(":1234", nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
