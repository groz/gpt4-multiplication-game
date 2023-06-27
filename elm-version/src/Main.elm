module Main exposing (main)

import Browser
import Html exposing (Html, button, div, pre, text)
import Html.Events exposing (onClick)
import Http
import Json.Decode exposing (Decoder, bool, field, int, map2, string)
import Platform.Cmd exposing (none)
import Random
import Task
import Time


type alias Model =
    { dice : Maybe Int
    , time : Time.Posix
    , rolling : Bool
    }


type Msg
    = Tick Time.Posix
    | Roll Int
    | Start
    | Stop


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub Msg
subscriptions model =
    if model.rolling then
        Time.every 100 Tick

    else
        Sub.none


init : () -> ( Model, Cmd Msg )
init _ =
    ( { dice = Nothing
      , time = Time.millisToPosix 0
      , rolling = False
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Tick time ->
            ( { model | time = time }, Random.generate Roll (Random.int 1 6) )

        Roll diceValue ->
            ( { model | dice = Just diceValue }, Cmd.none )

        Start ->
            ( { model | rolling = True }, Cmd.none )

        Stop ->
            ( { model | rolling = False, dice = Nothing }, Cmd.none )


view : Model -> Html Msg
view model =
    div []
        [ button [ onClick Start ] [ text "Start" ]
        , button [ onClick Stop ] [ text "Stop" ]
        , viewDice model.dice
        ]


viewDice : Maybe Int -> Html Msg
viewDice dice =
    div []
        [ case dice of
            Just value ->
                value |> String.fromInt |> text

            Nothing ->
                text "Roll the dice!"
        ]
