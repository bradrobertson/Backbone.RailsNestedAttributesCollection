/**
*
*
*   A collection for tracking deleted nested models for a Rails backend
*   Uses the Rails convention of adding _destroy param to existing models
*
*/
(function(){

  /**
  *
  *   @private
  *   @constructor
  *
  *   A collection that binds to its parent to track items removed from it
  *
  */
  var DeletedCollection = Backbone.Collection.extend({
    /**
    *
    *   @public
    *
    *   Description
    *
    */
    initialize: function(){
      _.bindAll(this, "_addDeleted");

      this.parent.on("remove", this._addDeleted);
    },

    /**
    *
    *   @private
    *   @param {Backbone.Model} model The model deleted from the collection
    *
    *   Adds the model removed from the main collection into our deleted collection
    *
    */
    _addDeleted: function(model){
      if( !model.isNew() ){
        model.set("_destroy", true);
        this.add(model);
      }
    }
  });

  var RailsNestedAttributesCollectionMixin = {

    /**
    *
    *   @private
    *   @override
    *
    *   Override the internal _reset to add in a deleted attribute
    *
    */
    _reset: function(){
      Backbone.Collection.prototype._reset.call(this);

      // remove bindings to our old deleted collection if it exists
      if(this.deleted){ this.off("remove", this.deleted._addDeleted); }

      // Create a new collection with a parent attribute set to this collection
      // to track deletions from this collection
      var ChildCollection = DeletedCollection.extend({parent: this});
      this.deleted = new ChildCollection();
    },

    /**
    *
    *   @public
    *   @return {Object} Serialized collection including models to destroy server-side
    *   @override
    *
    *   Serialize the default collection plus the deleted collection of models
    *
    */
    toJSON: function(){
      var models        = Backbone.Collection.prototype.toJSON.call(this),
          deletedModels = Backbone.Collection.prototype.toJSON.call(this.deleted);

      return models.concat(deletedModels);
    }

  };

  Backbone.RailsNestedAttributesCollection = Backbone.Collection.extend(RailsNestedAttributesCollectionMixin);

})();