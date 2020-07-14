import $ from 'jquery';
import QuestionWithAnswersView from './base/question-with-answers-view';

export default class RankByDragQuestionView extends QuestionWithAnswersView {
    constructor(question, settings) {
        super(question, settings);

        this._draggingAnswer = null;
        this._draggingAnswerNodeOffset = null;

        this._selectedAnswerClass = 'cf-dnd-ranking-answer--ranked';

        this._controlContainer = this._container.find('.cf-dnd-ranking');
        this._unrankedListNode = this._controlContainer.find('.cf-dnd-ranking-list--unranked .cf-dnd-ranking-list__item-list');
        this._rankedListNode = this._controlContainer.find('.cf-dnd-ranking-list--ranked .cf-dnd-ranking-list__item-list');
        this._rankedListCounterNode = this._controlContainer.find('.cf-dnd-ranking-list--ranked .cf-dnd-ranking-list__counter');
        this._dynamicPlaceholderNode = null;

        this._hasCounter = this._question.multiCount.max !== undefined || this._question.required;
        this._maxRankedAnswersCountLimit = this._question.multiCount.equal || this._question.multiCount.max || this._question.answers.length;
        this._dropZones = [];
        this._autoScroll = false;

        this._attachToDom();
    }

    detachModelHandlers() {
        super.detachModelHandlers();

        $(window)
            .off('mousemove', this._onDocumentMouseMove)
            .off('mouseup', this._onDocumentMouseUp)
            .off('touchmove', this._onDocumentTouchMove)
            .off('touchend', this._onDocumentTouchEnd);

        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code)
                .off('mousedown', this._onAnswerMouseDown)
                .off('touchstart', this._onAnswerTouchStart);
        });
    }

    _attachToDom() {
        this.answers.filter(answer => answer.isOther).forEach((answer) => {
            this._getAnswerOtherNode(answer.code)
                .on('input', e => this._onAnswerOtherNodeValueChange(answer, e.target.value))
                .on('mousedown', e => e.stopPropagation())
                .on('touchstart', e => e.stopPropagation());
        });

        // mouse
        this._onAnswerMouseDown = this._onAnswerMouseDown.bind(this);
        this._onDocumentMouseMove = this._onDocumentMouseMove.bind(this);
        this._onDocumentMouseUp = this._onDocumentMouseUp.bind(this);
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('mousedown', event => this._onAnswerMouseDown(event, answer));
        });

        $(window)
            .on('mousemove', this._onDocumentMouseMove)
            .on('mouseup', this._onDocumentMouseUp);

        // touch
        this._onAnswerTouchStart = this._onAnswerTouchStart.bind(this);
        this._onDocumentTouchMove = this._onDocumentTouchMove.bind(this);
        this._onDocumentTouchEnd = this._onDocumentTouchEnd.bind(this);
        this._question.answers.forEach(answer => {
            this._getAnswerNode(answer.code).on('touchstart', event => this._onAnswerTouchStart(event, answer));
        });

        $(window)
            .on('touchmove', this._onDocumentTouchMove)
            .on('touchend', this._onDocumentTouchEnd);

        // TODO: this fix dragging and scrolling in the same time. need to investigate this fix.
        this._controlContainer.on('touchstart', () => {
        });
    }

    _onModelValueChange({changes}) {
        this._updateAnswerLists(changes);
        this._updateAnswerOtherNodes(changes);
    }

    _updateAnswerLists(changes) {
        if (!changes.values) {
            return;
        }

        this._freezeAnswerListsSizes();

        this._syncRankedListToModel();
        this._syncUnrankedListToModel();

        this._updateRankedAnswersCounter();

        const isExceedLimit = Object.keys(this._question.values).length > this._maxRankedAnswersCountLimit;
        this._toggleRankedListLimitReached(isExceedLimit);

        this._unfreezeAnswerListsSizes();
    }

    _syncRankedListToModel() {
        Object.entries(this._question.values)
            .sort((pairA, pairB) => pairA[1] - pairB[1])
            .forEach(([answerCode, rank]) => {
                const answerNode = this._getAnswerNode(answerCode);
                answerNode.addClass(this._selectedAnswerClass);
                this._setRankToAnswerNode(answerNode, rank);
                this._rankedListNode.append(answerNode);
            });
    }

    _syncUnrankedListToModel() {
        let unrankedOffset = 0;
        this._question.answers.forEach((answer, index) => {
            const answerRank = this._question.values[answer.code] || null;

            if (answerRank !== null) {
                unrankedOffset++;
                return;
            }

            const answerNode = this._getAnswerNode(answer.code);
            answerNode.removeClass(this._selectedAnswerClass);

            const currentUnrankedAnswerNode = this._unrankedListNode.children().eq(index - unrankedOffset);
            if (currentUnrankedAnswerNode.length === 0) {
                this._unrankedListNode.append(answerNode);
                return;
            }

            if (currentUnrankedAnswerNode.data('answer-code') !== answer.code) {
                currentUnrankedAnswerNode.before(answerNode);
            }
        });
    }

    _updateRankedAnswersCounter() {
        if (!this._hasCounter) {
            return;
        }
        const text = Object.keys(this._question.values).length + ' / ' + this._maxRankedAnswersCountLimit;
        this._rankedListCounterNode.text(text);
    }

    _setRankToAnswerNode(answerNode, rank) {
        answerNode.find('.cf-dnd-ranking-answer__rank').text(rank);
    }

    _setRankToPlaceholderNode(placeholderNode, rank) {
        placeholderNode.find('.cf-dnd-ranking-answer-placeholder__rank').text(rank);
    }

    _showAnswerError(validationResult) {
        const target = this._getAnswerNode(validationResult.answerCode);
        const errorBlockId = this._getAnswerErrorBlockId(validationResult.answerCode);
        const errors = validationResult.errors.map(error => error.message);
        this._answerErrorBlockManager.showErrors(errorBlockId, target, errors);
    }

    _isAnswerRanked(answerCode) {
        return this._question.values[answerCode] !== undefined;
    }

    _isMaxRankedAnswersCountLimitReached() {
        return Object.keys(this._question.values).length >= this._maxRankedAnswersCountLimit;
    }

    _isInsideNode(node, pointerPosition) {
        const nodeCoordinates = this._getNodeCoordinates(node);
        return nodeCoordinates.x1 <= pointerPosition.x && nodeCoordinates.x2 >= pointerPosition.x && nodeCoordinates.y1 <= pointerPosition.y && nodeCoordinates.y2 >= pointerPosition.y;
    }

    _getNodeCoordinates(node) {
        const nodeOffset = node.offset();
        return {
            x1: nodeOffset.left,
            y1: nodeOffset.top,
            x2: nodeOffset.left + Math.round(node.outerWidth()),
            y2: nodeOffset.top + Math.round(node.outerHeight()),
        };
    }

    _getDraggingAnswerNode() {
        return this._draggingAnswer !== null ? this._getAnswerNode(this._draggingAnswer.code) : $([]);
    }

    _getDraggingAnswerNodeTranslateCoordinates(pointerPosition) {
        const screenPointerPosition = this._getScreenPointerPosition(pointerPosition);
        return {
            x: screenPointerPosition.x - this._draggingAnswerNodeOffset.x,
            y: screenPointerPosition.y - this._draggingAnswerNodeOffset.y
        };
    }

    _getScreenPointerPosition(pointerPosition) {
        return {
            x: (pointerPosition.x - window.pageXOffset),
            y: (pointerPosition.y - window.pageYOffset)
        };
    }

    _getMouseEventPointerPosition(event) {
        return {x: event.pageX, y: event.pageY};
    }

    _getTouchEventPointerPosition(event) {
        return {x: event.changedTouches[0].pageX, y: event.changedTouches[0].pageY};
    }

    _createUnrankedPlaceholderNode() {
        return $(`<div class="cf-dnd-ranking-list__item cf-dnd-ranking-answer-placeholder cf-dnd-ranking-answer-placeholder--unranked" style="height:${this._getDraggingAnswerNode().outerHeight()}px;"></div>`);
    }

    _removeUnrankedPlaceholderNode() {
        this._unrankedListNode.children().remove('.cf-dnd-ranking-answer-placeholder--unranked');
    }

    _createDynamicPlaceholderNode() {
        return $(`<div class="cf-dnd-ranking-list__item cf-dnd-ranking-answer-placeholder cf-dnd-ranking-answer-placeholder--ranked" style="height: ${this._getDraggingAnswerNode().outerHeight()}px;"><div class="cf-dnd-ranking-answer-placeholder__rank"></div></div>`);
    }

    _removeDynamicPlaceholderNode() {
        if (this._dynamicPlaceholderNode !== null) {
            this._dynamicPlaceholderNode.remove();
            this._dynamicPlaceholderNode = null;
        }
    }

    _blurActiveInput(){
        const activeElement = $(document.activeElement);
        if(activeElement.is(':focus')){
            activeElement.blur();
        }
    }

    _updateDropZones() {
        this._dropZones = [];
        this._rankedListNode.children('.cf-dnd-ranking-answer--ranked, .cf-dnd-ranking-answer-placeholder--ranked').each((index, node) => {
            const $node = $(node);
            const rank = index + 1;
            if ($node.hasClass('cf-dnd-ranking-answer-placeholder')) {
                this._setRankToPlaceholderNode($node, rank)
            } else {
                this._setRankToAnswerNode($node, rank);
            }

            this._dropZones.push({
                coordinates: this._getNodeCoordinates($node),
                node: $node
            });
        });
    }

    _scroll(step) {
        if (!this._autoScroll) {
            return;
        }

        $(window).scrollTop($(window).scrollTop() + step);

        setTimeout(() => {
            this._scroll(step)
        }, 50);
    }

    _startDraggingAnswer(answer, pointerPosition) {
        this._draggingAnswer = answer;

        // save pointer offset related to answer node before change position
        const draggingNode = this._getDraggingAnswerNode();
        const screenPointerPosition = this._getScreenPointerPosition(pointerPosition);
        const {left, top} = draggingNode[0].getBoundingClientRect();

        this._draggingAnswerNodeOffset = {
            x: screenPointerPosition.x - left,
            y: screenPointerPosition.y - top
        };

        draggingNode
            .css({
                'height': `${draggingNode.outerHeight()}px`,
                'width': `${draggingNode.outerWidth()}px`
            })
            .removeClass(this._selectedAnswerClass)
            .addClass('cf-dnd-ranking-answer--dragging');
        this._setRankToAnswerNode(draggingNode, '');
        this._moveDraggingAnswer(pointerPosition);
    }


    _moveDraggingAnswer(pointerPosition) {
        const translateCoordinates = this._getDraggingAnswerNodeTranslateCoordinates(pointerPosition);
        this._getDraggingAnswerNode().css('transform', `translate3d(${translateCoordinates.x}px, ${translateCoordinates.y}px, 0)`);
    }

    _stopDraggingAnswer() {
        this._getDraggingAnswerNode()
            .css({
                'transform': '',
                'width': '',
                'height': ''
            })
            .removeClass('cf-dnd-ranking-answer--dragging');
        this._draggingAnswer = null;
        this._draggingAnswerNodeOffset = null;
    }

    _insertDynamicPlaceholder(pointerPosition) {
        const index = this._dropZones.findIndex((dropZone, index) => {
            let y2 = dropZone.coordinates.y2;
            //take the middle of answer node by axis y for last element
            if (index === this._dropZones.length - 1) {
                y2 = (dropZone.coordinates.y2 + dropZone.coordinates.y1) / 2;
            }
            return pointerPosition.y <= y2
        });

        //when pointer position lower than last dropzone
        if (index === -1) {
            this._rankedListNode.append(this._dynamicPlaceholderNode);
        } else {
            this._dropZones[index].node.before(this._dynamicPlaceholderNode);
        }
    }

    _moveDynamicPlaceholder(pointerPosition) {
        const placeholderIndex = this._dropZones.findIndex(dropZone => dropZone.node.is(this._dynamicPlaceholderNode));
        const offsetFromAnswerHeightMiddle = 10;
        const targetIndex = this._dropZones
            .map(dropZone => {
                const answerHeightMiddle = (dropZone.coordinates.y2 + dropZone.coordinates.y1) / 2;
                return {
                    y1: answerHeightMiddle - offsetFromAnswerHeightMiddle,
                    y2: answerHeightMiddle + offsetFromAnswerHeightMiddle
                };
            })
            .findIndex(heightInterval => pointerPosition.y >= heightInterval.y1 && pointerPosition.y <= heightInterval.y2);

        if (targetIndex < 0 || placeholderIndex === targetIndex) {
            return false;
        }

        if (targetIndex < placeholderIndex) {
            this._dropZones[targetIndex].node.before(this._dynamicPlaceholderNode);
        } else {
            this._dropZones[targetIndex].node.after(this._dynamicPlaceholderNode);
        }
        return true;
    }

    _toggleRankedListLimitReached(isReached = false) {
        this._controlContainer.find('.cf-dnd-ranking-list--ranked').toggleClass('cf-dnd-ranking-list--limit-exceeded', isReached);
    }

    // fix sizes before multiple DOM manipulation at once due to scroll jumping on mobile (F.E. create placeholder + make answer node abstract)
    _freezeAnswerListsSizes() {
        this._rankedListNode.css('height', this._rankedListNode.outerHeight());
        this._unrankedListNode.css('height', this._unrankedListNode.outerHeight());
    }

    _unfreezeAnswerListsSizes() {
        this._rankedListNode.css('height', '');
        this._unrankedListNode.css('height', '');
    }

    _handleAutoScrollOnPointerMove(screenPositionY) {
        if (screenPositionY < 50) {
            this._autoScroll = true;
            this._scroll(-1);
            return;
        }

        if (screenPositionY > ($(window).height() - 50)) {
            this._autoScroll = true;
            this._scroll(1);
            return;
        }

        this._autoScroll = false;
    }

    _onAnswerMouseDown(event, answer) {
        if (event.which !== 1) {
            return;
        }

        event.stopPropagation();

        const position = this._getMouseEventPointerPosition(event);
        this._onAnswerMoveStart(answer, position);
    }

    _onDocumentMouseMove(event) {
        if (!this._draggingAnswer) {
            return;
        }

        event.preventDefault();

        this._handleAutoScrollOnPointerMove(event.clientY);

        const position = this._getMouseEventPointerPosition(event);
        this._onAnswerMove(position);
    }

    _onDocumentMouseUp(event) {
        if (!this._draggingAnswer) {
            return;
        }

        event.preventDefault();

        const position = this._getMouseEventPointerPosition(event);

        // disable auto scroll
        this._autoScroll = false;

        this._onAnswerMoveEnd(position);
    }

    _onAnswerTouchStart(event, answer) {
        if (this._draggingAnswer) {
            return true;
        }

        if (event.cancelable) {
            event.stopPropagation();
            event.preventDefault();
        }

        const position = this._getTouchEventPointerPosition(event);
        this._onAnswerMoveStart(answer, position);
    }

    _onDocumentTouchMove(event) {
        if (!this._draggingAnswer) {
            return;
        }

        this._handleAutoScrollOnPointerMove(event.changedTouches[0].clientY);

        const position = this._getTouchEventPointerPosition(event);
        this._onAnswerMove(position);
    }

    _onDocumentTouchEnd(event) {
        if (!this._draggingAnswer) {
            return;
        }

        if (event.cancelable) {
            event.stopPropagation();
            event.preventDefault();
        }

        const position = this._getTouchEventPointerPosition(event);

        // disable auto scroll
        this._autoScroll = false;

        this._onAnswerMoveEnd(position);
    }

    _onAnswerMoveStart(answer, pointerPosition) {
        this._freezeAnswerListsSizes();
        this._blurActiveInput();

        this._startDraggingAnswer(answer, pointerPosition);

        const draggingNode = this._getDraggingAnswerNode();
        if (this._isAnswerRanked(this._draggingAnswer.code)) {
            this._dynamicPlaceholderNode = this._createDynamicPlaceholderNode();
            draggingNode.before(this._dynamicPlaceholderNode);
        } else {
            draggingNode.after(this._createUnrankedPlaceholderNode());
        }

        this._updateDropZones();
        this._unfreezeAnswerListsSizes();
    }

    _onAnswerMove(pointerPosition) {
        this._moveDraggingAnswer(pointerPosition);

        const isInsideRankedListNode = this._isInsideNode(this._rankedListNode, pointerPosition);
        const dragFromRankedList = this._isAnswerRanked(this._draggingAnswer.code);

        // update limit
        let rankedAnswersModifier = 0;
        if (dragFromRankedList && !isInsideRankedListNode) {
            rankedAnswersModifier = -1;
        } else if (!dragFromRankedList && isInsideRankedListNode) {
            rankedAnswersModifier = 1;
        }
        const willExceedLimit = Object.keys(this._question.values).length + rankedAnswersModifier > this._maxRankedAnswersCountLimit;
        this._toggleRankedListLimitReached(willExceedLimit);

        if (!isInsideRankedListNode || (willExceedLimit && !dragFromRankedList)) {
            return;
        }

        let rankedListIsChanged = false;
        if (this._dynamicPlaceholderNode === null) {
            this._dynamicPlaceholderNode = this._createDynamicPlaceholderNode();
            this._insertDynamicPlaceholder(pointerPosition);
            rankedListIsChanged = true;
        } else {
            rankedListIsChanged = this._moveDynamicPlaceholder(pointerPosition);
        }

        if (rankedListIsChanged) {
            this._updateDropZones();
        }
    }

    _onAnswerMoveEnd(pointerPosition) {
        this._freezeAnswerListsSizes();

        const draggingAnswerNode = this._getDraggingAnswerNode();

        const dropToRankedList = this._isInsideNode(this._rankedListNode, pointerPosition);
        const dragFromRankedList = this._isAnswerRanked(this._draggingAnswer.code);

        let rankedListOrderIsChanged = false;
        if (dragFromRankedList) { // from ranked
            if (dropToRankedList) { // to ranked
                draggingAnswerNode.addClass(this._selectedAnswerClass);
                this._dynamicPlaceholderNode.replaceWith(draggingAnswerNode);
                rankedListOrderIsChanged = true;
            } else { // to unranked
                this._question.setValue(this._draggingAnswer.code, null);
                rankedListOrderIsChanged = true;
            }
        } else { // from unranked
            if (dropToRankedList && !this._isMaxRankedAnswersCountLimitReached()) {
                draggingAnswerNode.addClass(this._selectedAnswerClass);
                this._dynamicPlaceholderNode.replaceWith(draggingAnswerNode);
                rankedListOrderIsChanged = true;
            }

            this._removeUnrankedPlaceholderNode();
        }
        // clean up anyway
        this._removeDynamicPlaceholderNode();

        const isExceedLimit = Object.keys(this._question.values).length > this._maxRankedAnswersCountLimit;
        this._toggleRankedListLimitReached(isExceedLimit);

        this._stopDraggingAnswer();

        this._unfreezeAnswerListsSizes();

        // update ranked answer ranks
        if (rankedListOrderIsChanged) {
            this._rankedListNode.children('.cf-dnd-ranking-answer--ranked').each((index, node) => this._question.setValue($(node).data('answer-code'), index + 1));
        }

        this._updateDropZones();
    }

    _onAnswerOtherNodeValueChange(answer, value) {
        this._question.setOtherValue(answer.code, value);
    }
}