export default class Accordion {
    constructor(panels) {
        this._panels = panels;
        this._panels.forEach(item => item.toggleEvent.on(() => this._onPanelToggle(item)));
    }

    openPanel(panelIndex) {
        if (panelIndex >= this._panels.length && panelIndex < 0) {
            return;
        }

        this._panels[panelIndex].open();
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
