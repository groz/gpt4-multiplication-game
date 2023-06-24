module Main exposing (main)

import Browser
import Html exposing (Html, pre, text)
import Http
import Json.Decode exposing (Decoder, field, int, map2, string)
import Platform.Cmd exposing (none)
import Random
import Task
import Time


type alias Model =
    { dice : Int
    , time : Time.Posix
    }


type Msg
    = Tick Time.Posix
    | Roll Int


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
    Time.every 1000 Tick


init : () -> ( Model, Cmd Msg )
init _ =
    ( { dice = 1, time = Time.millisToPosix 0 }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Tick time ->
            ( { model | time = time }, Random.generate Roll (Random.int 1 6) )

        Roll dice ->
            ( { model | dice = dice }, Cmd.none )


view : Model -> Html Msg
view model =
    model.dice |> String.fromInt |> text
