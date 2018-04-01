package main

import (
	//"fmt"
	"strconv"
	"time"
)

const (
	sendWholeDataLoop = time.Second / 20
)

type Hub struct {
	Players    map[*Player]string
	register   chan *Player
	unregister chan *Player
	broadcast  chan PlayerLoc
	Info       chan interface{}
	allInfo    map[string]interface{}
	allData    map[string]Loc
	Stamp      int64
}

func createHub() *Hub {
	hub := &Hub{
		make(map[*Player]string),
		make(chan *Player),
		make(chan *Player),
		make(chan PlayerLoc),
		make(chan interface{}),
		make(map[string]interface{}),
		make(map[string]Loc),
		0,
	}
	return hub
}

func (h *Hub) run() {
	ticker := time.NewTicker(sendWholeDataLoop)
	readyToSend := false
	playerId := 0
	defer func() {
		ticker.Stop()
	}()
	for {
		select {
		case player := <-h.register:
			h.Players[player] = strconv.Itoa(playerId)
			h.allData[h.Players[player]] = Loc{}
			player.Send <- strconv.Itoa(playerId)
			playerId++
		case player := <-h.unregister:
			if id, ok := h.Players[player]; ok {
				delete(h.allData, id)
				delete(h.Players, player)
				//close player send channel
				close(player.Send)
			}
		case playerLoc := <-h.broadcast:
			h.allData[playerLoc.Id] = Loc{h.Stamp, playerLoc.CommandNum, playerLoc.X, playerLoc.Y}
			readyToSend = true
			//add player data to allData
		case Info := <-h.Info:
			for player := range h.Players {
				select {
				case player.Send <- Info:
				default:
					close(player.Send)
					delete(h.allData, h.Players[player])
					delete(h.Players, player)
				}
			}
		case <-ticker.C:
			h.Stamp += 1
			if readyToSend == true {
				readyToSend = false
				message := &Message{"COR", h.allData}
				for player := range h.Players {
					//send to player channel
					select {
					case player.Send <- message:
					default:
						close(player.Send)
						delete(h.allData, h.Players[player])
						delete(h.Players, player)
					}
				}
			}
		}
	}
}
