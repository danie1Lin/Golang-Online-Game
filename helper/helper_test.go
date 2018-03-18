package helper

import (
	"fmt"
	"testing"
)

type move struct {
	Left  string
	Right string
	Up    string
	Down  string
}

func TestSetField(t *testing.T) {
	m := map[string]interface{}{}
	m["Up"] = "True"
	m["Down"] = "False"
	s := &move{}
	err := MapToStruct(m, s)
	if err != nil {
	}
	t.Log("Past!")
	fmt.Println(m)
	fmt.Println(*s)
}
