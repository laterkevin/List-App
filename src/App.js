import React from 'react'
import Modell from './model/Shopping'
import GruppenTag from './components/GruppenTag'
import GruppenDialog from './components/GruppenDialog'
import SortierDialog from "./components/SortierDialog";

/**
 * @version 1.0
 * @author Kevin Later <info@kevinlater.com>
 * @description Diese App ist eine Einkaufsliste mit React.js und separatem Model, welche Offline verwendet werden kann
 * @license Gnu Public Lesser License 3.0
 *
 */
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      aktiveGruppe: null,
      showGruppenDialog: false,
      showSortierDialog: false,
      einkaufenAufgeklappt: true,
      erledigtAufgeklappt: false
    }
  }

  componentDidMount() {
    Modell.laden()
    // Auf-/Zu-Klapp-Zustand aus dem LocalStorage laden
    let einkaufenAufgeklappt = localStorage.getItem("einkaufenAufgeklappt")
    einkaufenAufgeklappt = (einkaufenAufgeklappt == null) ? true : JSON.parse(einkaufenAufgeklappt)

    let erledigtAufgeklappt = localStorage.getItem("erledigtAufgeklappt")
    erledigtAufgeklappt = (erledigtAufgeklappt == null) ? false : JSON.parse(erledigtAufgeklappt)

    this.setState({
      aktiveGruppe: Modell.aktiveGruppe,
      einkaufenAufgeklappt: einkaufenAufgeklappt,
      erledigtAufgeklappt: erledigtAufgeklappt
    })
  }

  /** klappt Kategorie einkaufen aus oder zu */
  einkaufenAufZuKlappen() {
    const neuerZustand = !this.state.einkaufenAufgeklappt
    localStorage.setItem("einkaufenAufgeklappt", neuerZustand)
    this.setState({einkaufenAufgeklappt: neuerZustand})
  }

  /** klappt Kategorie erledigt aus oder zu */
  erledigtAufZuKlappen() {
    const neuerZustand = !this.state.erledigtAufgeklappt
    localStorage.setItem("erledigtAufgeklappt", neuerZustand)
    this.setState({erledigtAufgeklappt: neuerZustand})
  }

  /** Löscht den Local Storage */
  lsLoeschen() {
    if (confirm("Wollen Sie wirklich alles löschen?!")) {
      localStorage.clear()
    }
  }

  /**
   * Hakt einen Artikel ab oder reaktiviert ihn
   * @param {Artikel} artikel - der aktuelle Artikel, der gerade abgehakt oder reaktiviert wird
   */
  artikelChecken = (artikel) => {
    artikel.gekauft = !artikel.gekauft
    const aktion = (artikel.gekauft) ? "erledigt" : "reaktiviert"
    Modell.informieren("[App] Artikel \"" + artikel.name + "\" wurde " + aktion)
    this.setState(this.state)
  }

  /** Fügt einen Artikel hinzu */
  artikelHinzufuegen() {
    const eingabe = document.getElementById("artikelEingabe")
    const artikelName = eingabe.value.trim()
    if (artikelName.length > 0) {
      Modell.aktiveGruppe.artikelHinzufuegen(artikelName)
      this.setState(this.state)
    }
    eingabe.value = ""
    eingabe.focus()
  }

  /**
   * Markiert die aktive Gruppe farbig und fügt nur in der aktiven Gruppe artikel hinzu
   * @param {gruppe} gruppe - Die aktuelle Gruppe wird als aktive Gruppe gesetzt
   * */
  setAktiveGruppe(gruppe) {
    Modell.aktiveGruppe = gruppe
    Modell.informieren("[App] Gruppe \"" + gruppe.name + "\" ist nun aktiv")
    this.setState({aktiveGruppe: Modell.aktiveGruppe})
  }

  /**
   * Schließt den Sortier Dialog
   * @param {reihenfolge} reihenfolge - Eigene Reihenfolge
   * @param {sortieren}  sortieren - aufsteigend, absteigend
   */
  closeSortierDialog = (reihenfolge, sortieren) => {
    if (sortieren) {
      Modell.sortieren(reihenfolge)
    }
    this.setState({showSortierDialog: false})
  }

  render() {
    let nochZuKaufen = []
    if (this.state.einkaufenAufgeklappt == true) {
      for (const gruppe of Modell.gruppenListe) {
        nochZuKaufen.push(
          <GruppenTag
            key={gruppe.id}
            aktiv={gruppe == this.state.aktiveGruppe}
            aktiveGruppeHandler={() => this.setAktiveGruppe(gruppe)}
            checkHandler={this.artikelChecken}
            gekauft={false}
            gruppe={gruppe}
          />)
      }
    }

    let schonGekauft = []
    if (this.state.erledigtAufgeklappt) {
      for (const gruppe of Modell.gruppenListe) {
        schonGekauft.push(
          <GruppenTag
            key={gruppe.id}
            aktiveGruppeHandler={() => this.setAktiveGruppe(gruppe)}
            checkHandler={this.artikelChecken}
            gekauft={true}
            gruppe={gruppe}
          />)
      }
    }

    let gruppenDialog = ""
    if (this.state.showGruppenDialog) {
      gruppenDialog = <GruppenDialog
        gruppenListe={Modell.gruppenListe}
        onDialogClose={() => this.setState({showGruppenDialog: false})}/>
    }

    let sortierDialog = ""
    if (this.state.showSortierDialog) {
      sortierDialog = <SortierDialog onDialogClose={this.closeSortierDialog}/>
    }

    return (
      <div id="container">
        <header>
          <div className="wrap">
            <span className="title">Todo's</span>
            <p><span className="subtitle">Kevin Later's Task Pocket Knife</span></p>
          </div>
          <h3></h3>
          <label
            className="mdc-text-field mdc-text-field--filled mdc-text-field--with-trailing-icon mdc-text-field--no-label">
            <span className="mdc-text-field__ripple"></span>
            <input className="mdc-text-field__input" type="search"
                   id="artikelEingabe" placeholder="Task hinzufügen..."
                   onKeyPress={e => (e.key == 'Enter') ? this.artikelHinzufuegen() : ''}/>
            <span className="mdc-line-ripple"></span>
            <i className="material-icons mdc-text-field__icon mdc-text-field__icon--trailing"
               tabIndex="0" role="button"
               onClick={() => this.artikelHinzufuegen()}>add_circle</i>
          </label>

        </header>
        <hr/>

        <main>
          <section>
            <h2>Task
              <i onClick={() => this.einkaufenAufZuKlappen()} className="material-icons">
                {this.state.einkaufenAufgeklappt ? 'expand_more' : 'expand_less'}
              </i>
            </h2>
            <dl>
              {nochZuKaufen}
            </dl>
          </section>
          <hr/>
          <section>
            <h2>Erledigt
              <i onClick={() => this.erledigtAufZuKlappen()} className="material-icons">
                {this.state.erledigtAufgeklappt ? 'expand_more' : 'expand_less'}
              </i>
            </h2>
            <dl>
              {schonGekauft}
            </dl>
          </section>
        </main>
        <hr/>

        <footer>
          <button className="mdc-button mdc-button--raised"
                  onClick={() => this.setState({showGruppenDialog: true})}>
            <span className="material-icons">bookmark_add</span>
            <span className="mdc-button__ripple"></span> Gruppen
          </button>
          <button className="mdc-button mdc-button--raised"
                  onClick={() => this.setState({showSortierDialog: true})}>
            <span className="material-icons">sort</span>
            <span className="mdc-button__ripple"></span> Sort
          </button>
          <button className="mdc-button mdc-button--raised"
                  onClick={this.lsLoeschen}>
            <span className="material-icons">clear_all</span>
            <span className="mdc-button__ripple"></span> Clear
          </button>
        </footer>

        {gruppenDialog}
        {sortierDialog}
      </div>
    )
  }
}

export default App
