export default class Accordion {
    constructor(panels) {
        this._panels = panels;
        this._panels.forEach(item => item.toggleEvent.on(() => this._onPanelToggle(item)));
    }

    get panels() {
        return this._panels;
    }

    getOpenPanelIndex() {
        return this._panels.findIndex(panel => panel.isOpen);
    }

    openPanel(panelIndex) {
        if (panelIndex >= this._panels.length && panelIndex < 0) {
            return;
        }

        this._panels[panelIndex].open();
    }

    closePanel(panelIndex) {
        if (panelIndex >= this._panels.length && panelIndex < 0) {
            return;
        }

        this._panels[panelIndex].close();
    }

    _onPanelToggle(currentPanel) {
        if (!currentPanel.isOpen) {
            return;
        }

        this._panels.forEach(panel => {
            if (currentPanel !== panel) {
                panel.close();
            }
        });
    }
}
